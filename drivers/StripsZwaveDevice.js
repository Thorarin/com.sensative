'use strict';

const Homey = require('homey');
const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

const i18n = {
  settings: {
    restartNeeded: {
      en: 'Restart the Sensative app for changes to take effect. You may also need to restart your Homey app if you get a blank screen.',
      nl: 'Herstart de Sensative app om de wijzigingen door te voeren. Het zou kunnen, dat u de Homey app moet herstarten, als u een leeg scherm krijgt.'
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

class StripsZwaveDevice extends ZwaveDevice {

  async ensureCapabilitiesMatch(capabilityIds) {
    const existingCapabilities = this.getCapabilities();
    const capabilitiesToAdd = capabilityIds.filter(x => !existingCapabilities.includes(x));
    const capabilitiesToRemove = existingCapabilities.filter(x => !capabilityIds.includes(x));

    for (const capability of capabilitiesToRemove) {
      this.tryRemoveCapability(capability);
    }

    for (const capability of capabilitiesToAdd) {
      this.tryAddCapability(capability);
    }

    return capabilitiesToAdd;
  }

  async tryAddCapability(capabilityId) {
    if (this.addCapability) {
      this.log(`Adding capability ${capabilityId}`);
      await this.addCapability(capabilityId);
    } else {
      this.log(`Unable to add capability ${capabilityId}; probably running an older Homey firmware.`);
    }
  }

  async tryRemoveCapability(capabilityId) {
    if (this.removeCapability) {
      this.log(`Removing capability ${capabilityId}`);
      await this.removeCapability(capabilityId);
    } else {
      this.log(`Unable to remove capability ${capabilityId}; probably running an older Homey firmware.`);
    }
  }

  async registerMaintenanceActions(actions) {
    const actionCapabilityIds = Object.keys(actions);
    const currentCapabilities = this.getCapabilities();

    for (const capabilityId of actionCapabilityIds) {
      if (!currentCapabilities.includes(capabilityId)) continue;
      this.registerCapabilityListener(capabilityId, actions[capabilityId]);
    }
  }

  determineCapabilityIds(settings) {
    const capabilities = ['measure_battery', 'alarm_battery' ];

    if (settings.tamper_alarm) {
      capabilities.push('alarm_tamper');
      if (settings.maintenance_actions) {
        capabilities.push('button.reset_tamper_alarm');
      }
    }

    return capabilities;
  }

  determineCapabilitiesChanging(oldSettings, newSettings) {
    const prev = this.determineCapabilityIds(oldSettings);
    const next = this.determineCapabilityIds(newSettings);
    return prev.length !== next.length || prev.some((value, index) => value !== next[index]);
  }

  registerBatteryCapabilities() {
    this.registerCapability('measure_battery', 'BATTERY', { getOpts: { getOnOnline: true } });
    this.registerCapability('alarm_battery', 'BATTERY');
  }

  registerTamperAlarmCapability() {
    this.registerCapability('alarm_tamper', 'NOTIFICATION', { reportParser: tamperReportParser });
  }

  async onSettings(oldSettings, newSettings, changedKeysArr) {
    const zwaveSettingsChanged = this.getManifestSettings()
      .some(setting => typeof setting.zwave !== 'undefined' && changedKeysArr.includes(setting.id));

    let message = await super.onSettings(oldSettings, newSettings, changedKeysArr);
    if (!zwaveSettingsChanged && this.determineCapabilitiesChanging(oldSettings, newSettings)) {
      message = Homey.__(i18n.settings.restartNeeded);
    }

    return message;
  }
}

module.exports = StripsZwaveDevice;