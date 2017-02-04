# pm2plugin
[![Build Status](https://travis-ci.org/kenahrens/newrelic-pm2-plugin.svg?branch=master)](https://travis-ci.org/kenahrens/newrelic-pm2-plugin)
This plugin will pull data from PM2 and publish to New Relic as a plugin

# Installation instructions
Need to install the dependencies and setup the config
- Run ```npm install``` to get the dependencies (PM2 must already be installed)
- Copy config-template.json to config.json and enter your New Relic license key
- Run plugin under PM2 with ```pm2 start ./pm2plugin.js```
- Data should show up under pm2plugin in your New Relic account

![PM2 Dashboard](/images/pm2-plugin-home.jpg)

# History

- 1.1.0 - Metrics for each PM2 process and added restarts per interval
- 1.0.4 - Close the connection to PM2 on each poll cycle
- 1.0.3 - Fix for when errors are not properly handled from Plugin API
- 1.0.2 - Support for multiple PM2 Servers (run on each PM2 instance)
- 1.0.1 - Support for single PM2 Server only, separate config file
- 1.0.0 - Initial prototype
