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

class StripsMaZw extends StripsZwaveDevice {
  async onMeshInit() {
    this.registerSetting('report_type', value => new Buffer([parseInt(value)]));
    this.registerSetting('led_indication', value => new Buffer([value ? 1 : 0]));

    const settings = this.getSettings();
    this.registerAlarmContactCapability(settings.report_type);
    await this.registerDynamicCapabilities(settings, true);
    this.registerBatteryCapabilities();
    this.updateMaintenanceActionRegistrations();
  }

  determineCapabilityIds(settings) {
    const capabilities = super.determineCapabilityIds(settings);
    capabilities.unshift('alarm_contact');
    return capabilities;
  }

  async onSettings(oldSettings, newSettings, changedKeysArr) {
    let result = await super.onSettings(oldSettings, newSettings, changedKeysArr);

    // Changing capabilities here seems to crash the Homey App UI on most occasions.
    //await this.registerDynamicCapabilities(newSettings, false);
    // if (changedKeysArr.includes('maintenance_actions')) {
    //   this.updateMaintenanceActionRegistrations();
    // }

    if (changedKeysArr.includes('report_type')) {
      this.registerAlarmContactCapability(newSettings.report_type);
      return i18n.settings.notificationTypeChangedSaveMessage;
    }

    return result;
  }

  async registerDynamicCapabilities(settings, initializing) {
    const addedCapabilities = await this.ensureCapabilitiesMatch(this.determineCapabilityIds(settings));
    const capabilities = initializing ? this.getCapabilities() : addedCapabilities;

    if (capabilities.includes('alarm_tamper')) {
      this.registerTamperAlarmCapability();
    }
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

  updateMaintenanceActionRegistrations() {
    const maintenanceActions = {
      'button.reset_tamper_alarm': () => this.setCapabilityValue('alarm_tamper', false)
    };

    this.registerMaintenanceActions(maintenanceActions);
  }
}

module.exports = StripsMaZw;
