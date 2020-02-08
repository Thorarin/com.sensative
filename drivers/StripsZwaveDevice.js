'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

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

    for (const capability of capabilitiesToAdd)  {
      this.tryAddCapability(capability);
    }

    return capabilitiesToAdd;
  }

  async ensureCapabilitiesAdded(capabilityIds) {
    const capabilities = this.getCapabilities();

    for (const capabilityId of capabilityIds) {
      if (capabilities.includes(capabilityId)) continue;
      this.tryAddCapability(capabilityId);
    }
  }

  async tryAddCapability(capabilityId) {
    if (this.addCapability) {
      this.log(`Adding capability ${capabilityId}`);
      await this.addCapability(capabilityId);
    } else {
      this.log(`Unable to add capability ${capabilityId}; probably running an older Homey firmware.`);
    }
  }

  async ensureCapabilitiesRemoved(capabilityIds) {
    const capabilities = this.getCapabilities();

    for (const capabilityId of capabilityIds) {
      if (!capabilities.includes(capabilityId)) continue;
      this.tryRemoveCapability(capabilityId);
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

  registerBatteryCapabilities() {
    this.registerCapability('measure_battery', 'BATTERY', { getOpts: { getOnOnline: true } });
    this.registerCapability('alarm_battery', 'BATTERY');
  }

  registerTamperAlarmCapability() {
    this.registerCapability('alarm_tamper', 'NOTIFICATION', { reportParser: tamperReportParser });
  }  
}

module.exports = StripsZwaveDevice;