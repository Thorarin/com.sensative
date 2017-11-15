'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class StripsMaZw extends ZwaveDevice {
  onMeshInit() {
    //this.enableDebug();
    //this.printNode();
    this.registerCapability('alarm_contact', 'NOTIFICATION');
    this.registerCapability('alarm_battery', 'BATTERY');
    this.registerCapability('measure_battery', 'BATTERY');
  }
}
module.exports = StripsMaZw;
