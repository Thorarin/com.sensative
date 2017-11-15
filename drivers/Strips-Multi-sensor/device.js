'use strict';

const ZwaveDevice = require('homey-meshdriver').ZwaveDevice;

class Strips-Multi-sensor extends ZwaveDevice {
	onMeshInit() {
		//this.enableDebug();
		//this.printNode();
		this.registerCapability('measure_temperature', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_luminance', 'SENSOR_MULTILEVEL');
		this.registerCapability('measure_moisture', 'SENSOR_MULTILEVEL');
		this.registerCapability('alarm_heat', 'NOTIFICATION');
		this.registerCapability('alarm_water', 'NOTIFICATION');
		this.registerCapability('alarm_battery', 'BATTERY');
		this.registerCapability('measure_battery', 'BATTERY');
	}
}
module.exports = Strips-Multi-sensor;
