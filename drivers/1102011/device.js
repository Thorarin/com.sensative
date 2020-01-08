'use strict';

const StripsZwaveDevice = require('../StripsZwaveDevice');

function luminanceReportParser(report) {
  const isLuminanceReport =
    report &&
    report.hasOwnProperty('Sensor Type') &&
    report.hasOwnProperty('Sensor Value (Parsed)') &&
    report['Sensor Type'] === 'Luminance (version 1)';

  if (!isLuminanceReport) return null;

  const sensorValue = report['Sensor Value (Parsed)'];

  if (sensorValue < 0) {
    // Early firmwares of Strips Comfort mistakenly use a 16-bit integer to represent the luminance value.
    // Z-Wave only supports signed integers, but the value was intended as unsigned.
    // This should work around that issue, since a lux value can never be negative anyway.
    return 65536 + sensorValue;
  }

  return sensorValue;
}

class StripsMultiSensor extends StripsZwaveDevice {
  async onMeshInit() {
    this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL', {
      getOpts: {
        getOnOnline: true,
      },
    });

    this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL', {
      reportParser: luminanceReportParser,
      getOpts: {
        getOnOnline: true,
      },
    });
    
    this.registerCapability('measure_humidity', 'SENSOR_MULTILEVEL', {
      reportParser: report => {
        if (report['Sensor Type'] === 'Moisture (v5)') {
          return report['Sensor Value (Parsed)'];
        }
        return null;
      },
      getOpts: {
        getOnOnline: true,
      },
    });

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
      },
      getOpts: {
        getOnOnline: true,
      },
    });

    this.registerCapability('alarm_water', 'NOTIFICATION', {
      getOpts: {
        getOnOnline: true,
      },
    });

    this.registerCapability('alarm_battery', 'BATTERY', {
      getOpts: {
        getOnOnline: true,
      },
    });

    this.registerCapability('measure_battery', 'BATTERY', {
      getOpts: {
        getOnOnline: true,
      },
    });

    await this.ensureCapabilitiesRemoved(['button.reset_heat_alarm', 'button.reset_water_alarm']);
  }
}
module.exports = StripsMultiSensor;