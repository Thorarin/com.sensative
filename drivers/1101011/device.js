'use strict';

const StripsZwaveDevice = require('../StripsZwaveDevice');

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

class StripsMaZw extends StripsZwaveDevice {
  async onMeshInit() {
    this.registerSetting('report_type', value => new Buffer([parseInt(value)]));
    this.registerSetting('led_indication', value => new Buffer([value ? 1 : 0]));

    const settings = this.getSettings();
    this.registerAlarmContactCapability(settings.report_type);
    this.registerCapability('measure_battery', 'BATTERY', { getOpts: { getOnOnline: true } });

    await this.ensureCapabilitiesAdded(['alarm_battery', 'alarm_tamper', 'button.reset_tamper_alarm']);
    this.registerBatteryCapabilities();
    this.registerMaintenanceActions();
  }

  registerBatteryCapabilities() {
    this.registerCapability('alarm_battery', 'BATTERY');
    this.registerCapability('alarm_tamper', 'NOTIFICATION', { reportParser: tamperReportParser });
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
      case '1':
        this.log('Using NOTIFICATION command class');
        this.registerCapability('alarm_contact', 'NOTIFICATION');
        break;
      default:
        this.log('No valid notification type set.');
        break;
    }
  }

  async registerMaintenanceActions() {
    const capabilities = this.getCapabilities();

    if (!capabilities.includes('button.reset_tamper_alarm')) {
      await this.addCapability('button.reset_tamper_alarm');
    }

    this.registerCapabilityListener('button.reset_tamper_alarm', () => this.setCapabilityValue('alarm_tamper', false));
  }
}

module.exports = StripsMaZw;
