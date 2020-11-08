'use strict';

const Homey = require('homey');
const StripsZwaveDevice = require('../StripsZwaveDevice');

class StripsMultiSensor extends StripsZwaveDevice {
  async onMeshInit() {
    this.registerTemperatureCapability();
    this.registerHeatAlarmCapability();

    this.registerSetting('temperature_offset', this.decimalTemperatureParser);
    this.registerSetting('temperature_delta', this.decimalTemperatureParser);
    this.registerSetting('temperature_alarm_hysteresis', this.decimalTemperatureParser);

    const settings = this.getSettings();
    this.registerDynamicCapabilities(settings, true);
    this.updateMaintenanceActionRegistrations();
  }

  determineCapabilityIds(settings) {
    const capabilities = [];

    capabilities.push('measure_temperature', 'alarm_heat');
    if (settings.maintenance_actions) {
      capabilities.push('button.reset_heat_alarm');
    }

    capabilities.push('measure_humidity', 'alarm_water');
    if (settings.maintenance_actions) {
      capabilities.push('button.reset_water_alarm');
    }

    return capabilities.concat(super.determineCapabilityIds(settings));
  }

  registerTemperatureCapability() {
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
  }

  registerHeatAlarmCapability() {
    this.registerCapability('alarm_heat', 'NOTIFICATION', {
      reportParser: report => { 
        if (report['Notification Type'] === 'Heat') {
          switch (report['Event']) {
            case 2: // Overheat
            case 6: // Underheat
              return true;
            case 0: // Heat alarm OFF
              return false;
          }
        }

        return null;
      }
    });
  }  

  registerHumidityCapability() {
    this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL', {
      reportParser: report => {
        if (report['Sensor Type'] === 'Moisture (v5)') {
          const value = report['Sensor Value (Parsed)'];
          
          // Only add warning if there is a significant deviation. Otherwise the warning message could become annoying.
          if (value <= -5) {
            this.log(`Humidity sensor reported value ${value}; recalibration may be needed.`);
            this.setWarning(Homey.__('humidityCalibrationWarning'));
            return 0;
          }

          return Math.max(value, 0);
        }
        return null;
      }
    });
  }

  registerWaterAlarmCapability() {
    this.registerCapability('alarm_water', 'NOTIFICATION');
  }

  async registerDynamicCapabilities(settings, initializing) {
    const addedCapabilities = await this.ensureCapabilitiesMatch(this.determineCapabilityIds(settings));
    const capabilities = initializing ? this.getCapabilities() : addedCapabilities;

    if (capabilities.includes('measure_humidity')) {
      this.registerHumidityCapability();
    }

    if (capabilities.includes('alarm_water')) {
      this.registerWaterAlarmCapability();
    }

    if (capabilities.includes('alarm_tamper')) {
      this.registerTamperAlarmCapability();
    }
  }

  decimalTemperatureParser(value) {
    return Math.round(value * 10);
  }

  updateMaintenanceActionRegistrations() {
    const maintenanceActions = {
      'button.reset_heat_alarm': () => this.setCapabilityValue('alarm_heat', false),
      'button.reset_water_alarm': () => this.setCapabilityValue('alarm_water', false),
      'button.reset_tamper_alarm': () => this.setCapabilityValue('alarm_tamper', false),
      'button.calibrate_humidity': () => this.calibrateHumidity()
    };

    this.registerMaintenanceActions(maintenanceActions);
  }

  async calibrateHumidity() {
    this.log('Starting calibration of humidity sensor');

    // Clear recalibration warning, if present.
    await this.unsetWarning();

    const commandClassConfiguration = this.getCommandClass('CONFIGURATION');

    if (this.node.battery === true && this.node.online === false) {
      this.log('Device is not online, calibration command will be queued');  
    }

    try {
      await commandClassConfiguration.CONFIGURATION_SET({
        'Parameter Number': 23,
        Level: { Size: 1, Default: 0 },
        'Configuration Value': Buffer.from([1]),
      });
    }
    catch (e) {
      this.log('Failed to send configuration parameter to start calibration', e);
    }
  }
}

module.exports = StripsMultiSensor;