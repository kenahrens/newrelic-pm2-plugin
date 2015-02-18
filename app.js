var pm2 = require('pm2');
var os = require('os');
var request = require('request');
var pjson = require('./package.json')

// Plugin Variables
var ver = pjson.version;
var license = pjson.nrlicense;
var guid = pjson.nrguid;
var url = pjson.nrurl;

function poll()
{
	// Connect or launch pm2
	pm2.connect(function(err){

		console.log('Just connected to PM2');

		// Pull down the list
		pm2.list(function(err, list) {

			// Start an output message
			var agent = {};
			agent.host = os.hostname();
			agent.pid = process.pid;
			agent.version = ver;
			
			var msg = {};
			msg.agent = agent;

			// Get the components
			var cmps = [];

			// Pull down data for each function
			list.forEach(function(l) {

				// Basic information
				var name = l.pm2_env.name
				var metrics = {};
				metrics['Component/pm2[uptime]'] = calcUptime(l.pm2_env.pm_uptime);
				metrics['Component/pm2[restarts]'] = l.pm2_env.restart_time;
				metrics['Component/pm2[cpu]'] = l.monit.cpu;
				metrics['Component/pm2[memory]'] = l.monit.memory;

				var cmp = {};
				cmp['name'] = name;
				cmp['guid'] = guid;
				cmp['duration'] = 60;
				cmp['metrics'] = metrics;
				cmps.push(cmp);
			});

			msg.components = cmps;
			postToNewRelic(msg);
		});
	});
	
	// Re-run every 60s
	setTimeout(poll, 60000)
}

function postToNewRelic(msg) {
	var msgString = JSON.stringify(msg);
	request({
		url: url,
		method: "POST",
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json',
			'X-License-Key': license
		},
		body: msgString
	}, function (err, httpResponse, body) {
		console.log('New Relic Reponse: %d', httpResponse.statusCode);
	});
	console.log('Just posted to New Relic: %s', msgString);
}

function calcUptime(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
	return seconds;
}

poll();