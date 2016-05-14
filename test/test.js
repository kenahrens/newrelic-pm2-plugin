var assert = require('assert');
var fs = require('fs');

describe('newrelic-pm2-plugin', function() {
  before(function(){
    try {
      console.log('checking for config.json');
      var config = require('../config.json');
      console.log('looks like config.json already exists');
    } catch (e) {
      // Create a temp config.json
      console.log('creating a temporary config.json for testing');
      fs.createReadStream('../config-template.json').pipe(fs.createWriteStream('../config.json'));
      console.log('temporary config.json created');
    }
  });
  it('loads', function() {
    var app = require('../pm2plugin.js');
  });
  after(function() {

  });
})
