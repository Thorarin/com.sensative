'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

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

class StripsMultiSensor extends ZwaveDevice {
  onMeshInit() {

    // Reset alarms on init, since these alarms tend to stick in true state.
    // The user can then restart the app, to get rid of sticky alarms.
    this.setCapabilityValue('alarm_water', false);
    this.setCapabilityValue('alarm_heat', false);

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
      getOpts: {
        getOnOnline: true,
      },
    });

    this.registerCapability('alarm_heat', 'NOTIFICATION', {
      reportParser: report => { 

        // Check Notification Type and event to ensure that the heat alarm should go on/off

        // Heat alarm ON (event 2 = overheat, event 6 = underheat)
        if (report["Notification Type"] === "Heat" && report["Event"] === 2) {
          return true
        }

        // Heat alarm ON (event 2 = overheat, event 6 = underheat)
        if (report["Notification Type"] === "Heat" && report["Event"] === 6) {
          return true
        }

        // Heat alarm OFF
        if (report["Notification Type"] === "Heat" && report["Event"] === 0) {
          return false
        }

        // No matching events, just return null
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
  }
}
module.exports = StripsMultiSensor;