"use strict";

const path			= require('path');
const ZwaveDriver	= require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/831

module.exports = new ZwaveDriver( path.basename(__dirname), {
	capabilities: {
		'alarm_contact': {
            // TODO: COMMAND_CLASS_ALARM doesn't seem to be recognized
			'command_class'				: 'COMMAND_CLASS_ALARM',
			'command_get'				: 'ALARM_GET',
			'command_report'			: 'ALARM_REPORT',
			'command_report_parser'		: function( report ){
                console.log(JSON.stringify(report));
				return report['Sensor Value'] === 'detected an event';
			}
		},
		'measure_battery': {
			'command_class'				: 'COMMAND_CLASS_BATTERY',
			'command_get'				: 'BATTERY_GET',
			'command_report'			: 'BATTERY_REPORT',
			'command_report_parser'		: function( report ) {
                console.log(JSON.stringify(report));
				if( report['Battery Level'] === "battery low warning" ) return 1;
				return report['Battery Level (Raw)'][0];
			}
		}
	}
})