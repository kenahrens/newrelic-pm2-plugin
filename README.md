# pm2plugin
[![Build Status](https://travis-ci.org/kenahrens/newrelic-pm2-plugin.svg?branch=master)](https://travis-ci.org/kenahrens/newrelic-pm2-plugin)
This plugin will pull data from PM2 and publish to New Relic as a plugin

# Installation instructions
Need to install the dependencies and setup the config
- Run ```npm install``` to get the dependencies (PM2 must already be installed)
- Copy config-template.json to config.json and enter your New Relic license key
- Run plugin under PM2 with ```pm2 start ./pm2plugin.js```
- Data should show up under pm2plugin in your New Relic account

![PM2 Dashboard](/images/pm2dashboard.png)
