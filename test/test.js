var assert = require('assert');
var fs = require('fs-extra');
var path = require('path');

describe('newrelic-pm2-plugin', function() {
  before(function(){
    try {
      console.log('checking for config.json');
      var config = require('../config.json');
      console.log('looks like config.json already exists');
    } catch (e) {
      // Create a temp config.json
      console.log('creating a temporary config.json for testing');
      fs.copySync(path.resolve(__dirname, '../config-template.json'),
        path.resolve(__dirname, '../config.json'));
    }
  });
  it('loads', function() {
    var app = require('../pm2plugin.js');
  });
  after(function() {

  });
})
