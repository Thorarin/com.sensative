"use strict";

const path          = require('path');
const ZwaveDriver   = require('homey-zwavedriver');

// http://www.pepper1.net/zwavedb/device/831

module.exports = new ZwaveDriver( path.basename(__dirname), {
    debug: false,
    capabilities: {
        'alarm_contact': {
            'command_class'             : 'COMMAND_CLASS_SENSOR_BINARY',
            'command_get'               : 'SENSOR_BINARY_GET',
            'command_report'            : 'SENSOR_BINARY_REPORT',
            'command_report_parser'     : function( report ){
                return report['Sensor Value (Raw)'][0] > 0;
            }
        },        
        'measure_battery': {
            'command_class'             : 'COMMAND_CLASS_BATTERY',
            'command_get'               : 'BATTERY_GET',
            'command_report'            : 'BATTERY_REPORT',
            'command_report_parser'     : function(report) {
                if( report['Battery Level'] === "battery low warning" ) return 1;
                return report['Battery Level (Raw)'][0];
            }
        }
    },
    settings: {
        "report_type": {
            "index": 1,
            "size": 1,
            "parser": function(input) {
                return new Buffer([ parseInt(input) ]);
            }
        },        
        "led_indication": {
            "index": 2,
            "size": 1,
            "parser": function(input) {
                return new Buffer([input ? 1 : 0 ]);
            }
        }
    } 
})