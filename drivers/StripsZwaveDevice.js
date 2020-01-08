'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class StripsZwaveDevice extends ZwaveDevice {
  async ensureCapabilitiesAdded(capabilityIds) {
    const capabilities = this.getCapabilities();

    for (const capabilityId of capabilityIds) {
      if (capabilities.includes(capabilityId)) continue;

      if (this.addCapability) {
        this.log(`Adding capability ${capabilityId}`);
        await this.addCapability(capabilityId);
      } else {
        this.log(`Unable to add capability ${capabilityId}; probably running an older Homey firmware.`);
      }
    }
  }
  
  async ensureCapabilitiesRemoved(capabilityIds) {
    const capabilities = this.getCapabilities();

    for (const capabilityId of capabilityIds) {
      if (!capabilities.includes(capabilityId)) continue;

      if (this.removeCapability) {
        this.log(`Removing capability ${capabilityId}`);
        await this.removeCapability(capabilityId);
      } else {
        this.log(`Unable to remove capability ${capabilityId}; probably running an older Homey firmware.`);
      }
    }
  }  
}

module.exports = StripsZwaveDevice;