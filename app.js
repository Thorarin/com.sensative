'use strict';

const Homey = require('homey');
const Log = require('homey-log').Log;

class SensativeZwave extends Homey.App {

  onInit() {

    this.log('Sensative Z-wave app is running...');

  }

}

module.exports = SensativeZwave;
