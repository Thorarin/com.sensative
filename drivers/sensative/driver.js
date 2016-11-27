"use strict";

const path          = require('path');
const ZwaveDriver   = require('homey-zwavedriver');

module.exports = new ZwaveDriver( path.basename(__dirname), {
    debug: true,
    capabilities: {
        'alarm_contact': {
            'command_class'             : 'COMMAND_CLASS_SENSOR_BINARY',
            'command_get'               : 'SENSOR_BINARY_GET',
            'command_report'            : 'SENSOR_BINARY_REPORT',
            'command_report_parser'     : function( report ){
                //console.log(JSON.stringify(report));
                return report['Sensor Value (Raw)'][0] > 0;
            }
        },        
        // 'alarm_contact': {
        //     'command_class'             : 'COMMAND_CLASS_NOTIFICATION',
        //     'command_get'               : 'NOTIFICATION_GET',
        //  'command_get_parser'        : function() {
        //      return {
        //          'V1 Alarm Type': 6,
        //          'Notification Type': 'Home Security',
        //          'Event': 6
        //      }
        //  },            
        //     'command_report'            : 'NOTIFICATION_REPORT',
        //     'command_report_parser'     : function(report) {
        //         console.log(JSON.stringify(report));
        //      return report['Alarm Level'] > 0;     
        //     }
        // },
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