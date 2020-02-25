This app adds support for the Sensative Strips family of products in Homey.

## Supported devices with most common parameters:
* Strips Guard (door/window sensor)
* Strips Drip
* Strips Comfort

## Supported Languages:
* English
* Dutch

Release notes
-------------
**2.2.0**
* Improved grouping of device settings
* Option to select Strips Comfort or Strips Drip in device settings, hiding unused capabilties and UI elements
* Option to enable tamper alarm capability for Comfort and Drip
* Option to disable maintenance actions.
  This can help HomeyKit users to work around an issue where the sensors are displayed as switches.

**2.1.3:**
* Fixed an issue with Strips Comfort heat alarm (thanks Vegard!)
* Added maintenance actions to reset alarms manually (requires Homey 3.1+)
* Added battery information for all supported devices
* Updated to latest homey-meshdriver (1.3.3)

**2.0.1:**
* Fixed a number of issues with Strips Drip and Strips Comfort

**2.0.0:**
* Support for notification command class for Strips Guard.
  Using this instead of the binary sensor command class should fix an issue with devices with firmware 0.7 or older.
* Add tamper alarm capability for Strips Guard
* Preliminary support for Strips Drip and Strips Comfort
* Upgraded to Homey SDK 2.0 
  
**1.0.3:**
* Z-Wave configuration parameters should be properly initialized upon inclusion now.
* Requires Homey 1.0.3 firmware due to an issue in combination with 1.0.1 and 1.0.2 firmwares.

**1.0.1:**
* In this initial version, Strips will be set to a simple binary sensor. I'd like to switch to using its default operating mode in the future, which may require the device to be re-added.
* The US version of Strips is not yet recognized. It may be added in a future version (testers needed).


Getting Started
---------------
If you haven't already installed the Homey CLI, do that first: 

    npm i -g homey
    
After that, running the app on your Homey is easy:

    npm i
    npm start

Of course, you're free to call `homey app run` manually, but you may have to copy the `app.json` from the `.homeycompose` folder once before being able to run the application.

Disclaimer
----------
This application is not affiliated with Sensative AB. Sensative AB is not responsible for the operation or content of this application.