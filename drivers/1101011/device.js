'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

const i18n = {
  settings: {
    notificationTypeChangedSaveMessage: {
      en: 'Notification type changed. In order to ensure continued proper operation, the Strips needs to be woken up manually.',
      nl: 'Notificatietype gewijzigd. Voor correct functioneren moet de Strips handmatig wakker gemaakt worden.'
    }
  }
};

function tamperReportParser(report) {
  if (report && report['Notification Type'] === 'Home Security' && report.hasOwnProperty('Event (Parsed)')) {
    if (report['Event (Parsed)'] === 'Tampering, Invalid Code') {
      return true;
    }
    if (report['Event'] === 254) {
      return false;
    }
  }
  return null;
}

class StripsMaZw extends ZwaveDevice {
  onMeshInit() {
    this.registerSetting('report_type', value => new Buffer([parseInt(value)]));
    this.registerSetting('led_indication', value => new Buffer([value ? 1 : 0]));

    const settings = this.getSettings();
    this.registerAlarmContactCapability(settings.report_type);
    this.registerCapability('measure_battery', 'BATTERY', { getOpts: { getOnOnline: true } });
    this.registerOptionalCapabilities();
  }

  /**
	 * Register capabilities which may not be advertised on the node when it was registed using an older version of the driver.
	 * At first glance, registering these unconditionally doesn't appear to be a problem, but warning messages about unobserved
   * rejected promises were appearing when the node was being removed. Apparently in future versions this will cause the app
   * to crash, so this is just to be on the safe side...
	 */
  registerOptionalCapabilities() {
    const capabilities = this.getCapabilities();

    if (capabilities.includes('alarm_battery')) {
      this.registerCapability('alarm_battery', 'BATTERY');
    }

    if (capabilities.includes('alarm_tamper')) {
      this.registerCapability('alarm_tamper', 'NOTIFICATION', { reportParser: tamperReportParser });
    }
  }

  async onSettings(oldSettings, newSettings, changedKeysArr) {
    let result = await super.onSettings(oldSettings, newSettings, changedKeysArr);

    if (changedKeysArr.includes('report_type')) {
      this.registerAlarmContactCapability(newSettings.report_type);
      return i18n.settings.notificationTypeChangedSaveMessage;
    }

    return result;
  }

  registerAlarmContactCapability(notificationType) {
    switch (notificationType) {
      case '0':
        this.log('Using SENSOR_BINARY command class');
        this.registerCapability('alarm_contact', 'SENSOR_BINARY');
        break;
      default:
        this.log('No valid notification type set.')
      case '1':
        this.log('Using NOTIFICATION command class')
        this.registerCapability('alarm_contact', 'NOTIFICATION');
        break;
    }
  }
}

module.exports = StripsMaZw;
