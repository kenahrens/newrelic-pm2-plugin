var app = require('../pm2plugin.js');
var assert = require('assert');
var fs = require('fs');

describe('newrelic-pm2-plugin', function() {
  before(function(){
    try {
      var config = require('../config.json');
    } catch (e) {
      // Create a temp config.json
      fs.createReadStream('../config-template.json').pipe(fs.createWriteStream('../config.json'));
    }
  });
  it('loads', function() {

  });
  after(function() {

  });
})
