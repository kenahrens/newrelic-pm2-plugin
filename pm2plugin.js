var pm2 = require('pm2');
var os = require('os');
var request = require('request');

// Plugin Variables
var config = require('./config.json');
var ver = config.nrversion;
var license = config.nrlicense;
var guid = config.nrguid;
var url = config.nrurl;

function poll()
{
	// Connect or launch pm2
	pm2.connect(function(err){

		console.log('Just connected to PM2');

		// Pull down the list
		pm2.list(function(err, list) {

			// Start an output message
			var msg = {};

			// Create the agent subsection
			var agent = {};
			msg.agent = agent;
			agent.host = os.hostname();
			agent.pid = process.pid;
			agent.version = ver;

			// Create the components array (with only 1 value)
			var components = [];
			msg.components = components;
			components[0] = {};
			components[0].name = os.hostname();
			components[0].guid = guid;
			components[0].duration = 30;

			// Create the metrics subsection
			var metrics = {};
			components[0].metrics = metrics;
			var totalUptime = 0;
			var totalRestarts = 0;
			var totalCpu = 0;
			var totalMemory = 0;

			// Pull down data for each function
			list.forEach(function(proc) {

				// Get the metrics
				var processName = proc.pm2_env.name;
				var processUptime = calcUptime(proc.pm2_env.pm_uptime);
				var processRestarts = proc.pm2_env.restart_time;
				var processCpu = proc.monit.cpu;
				var processMemory = proc.monit.memory;

				// Store the metrics
				var namePrefix = 'Component/process/' + processName;
				metrics[namePrefix + '[uptime]'] = processUptime;
				metrics[namePrefix + '[restarts]'] = processRestarts;
				metrics[namePrefix + '[cpu]'] = processCpu;
				metrics[namePrefix + '[memory]'] = processMemory;

				// Increment the totals
				totalUptime += processUptime;
				totalRestarts += processRestarts;
				totalCpu += processCpu;
				totalMemory += processMemory;
			});

			// Create the rollup metrics
			metrics['Component/rollup/all[uptime]'] = totalUptime;
			metrics['Component/rollup/all[restarts]'] = totalRestarts;
			metrics['Component/rollup/all[cpu]'] = totalCpu;
			metrics['Component/rollup/all[memory]'] = totalMemory;

			// console.log(msg.components[0]);
			postToNewRelic(msg);
		});
	});

	// Re-run every 30s
	setTimeout(poll, 30000)
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
		if (!err) {
			console.log('New Relic Reponse: %d', httpResponse.statusCode);
			if(body) {
				console.log('Response from NR: ' + body);
			}
		} else {
			console.log('*** ERROR ***');
			console.log(err);
		}
	});
	// console.log('Just posted to New Relic: %s', msgString);
}

function calcUptime(date) {
	var seconds = Math.floor((new Date() - date) / 1000);
	return seconds;
}

poll();
