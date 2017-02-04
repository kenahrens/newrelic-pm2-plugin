var pm2 = require('pm2');
var os = require('os');
var request = require('request');

// Version needs to be outside the config file
var ver = '1.1.0';

// Plugin Variables
var config = require('./config.json');
var license = config.nrlicense;
var guid = config.nrguid;
var url = config.nrurl;

// Running restart 
var restartList = {};

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

			// Process Totals
			var processArr = {};

			// PM2 Totals
			var totalUptime = 0;
			var totalRestarts = 0;
			var totalCpu = 0;
			var totalMemory = 0;
			var totalIntervalRestarts = 0;

			// Pull down data for each function
			list.forEach(function(proc) {

				// Get the metrics
				var processPid = proc.pm_id;
				var processName = proc.pm2_env.name;
				var processUptime = calcUptime(proc.pm2_env.pm_uptime);
				var processTotalRestarts = proc.pm2_env.restart_time;
				var processCpu = proc.monit.cpu;
				var processMemory = proc.monit.memory;

				// Calculate per interval restarts
				var processPreviousRestarts = restartList[processName] || 0;
				var processIntervalRestarts = processTotalRestarts - processPreviousRestarts;
				restartList[processName] = processTotalRestarts;

				// Store the metrics
				var namePrefix = 'Component/id/' + processPid + '/' + processName;
				metrics[namePrefix + '[uptime]'] = processUptime;
				metrics[namePrefix + '[restarts]'] = processTotalRestarts;
				metrics[namePrefix + '[cpu]'] = processCpu;
				metrics[namePrefix + '[memory]'] = processMemory;
				metrics[namePrefix + '[intervalRestarts]'] = processIntervalRestarts;

				// Increment the Process totals
				var currentProcess = processArr[processName];
				if (currentProcess != null) {
					currentProcess.count++;
					currentProcess.uptime += processUptime;
					currentProcess.totalRestarts += processTotalRestarts;
					currentProcess.cpu += processCpu;
					currentProcess.memory += processMemory;
					currentProcess.intervalRestarts += processIntervalRestarts;
					processArr[processName] = currentProcess;
				} else {
					// Initialize the data for this process
					processArr[processName] = {
						'count': 1,
						'uptime': processUptime,
						'totalRestarts': processTotalRestarts,
						'cpu': processCpu,
						'memory': processMemory,
						'intervalRestarts': processIntervalRestarts
					}
				}

				// Increment the PM2 totals
				totalUptime += processUptime;
				totalRestarts += processTotalRestarts;
				totalCpu += processCpu;
				totalMemory += processMemory;
				totalIntervalRestarts += processIntervalRestarts;
			});

			// Create the Process rollup metrics
			for (var processName in processArr) {
				var currentProcess = processArr[processName];
				var namePrefix = 'Component/process/' + processName;
				metrics[namePrefix + '[count]'] = currentProcess.count;
				metrics[namePrefix + '[uptime]'] = currentProcess.uptime;
				metrics[namePrefix + '[restarts]'] = currentProcess.totalRestarts;
				metrics[namePrefix + '[cpu]'] = currentProcess.cpu;
				metrics[namePrefix + '[memory]'] = currentProcess.memory;
				metrics[namePrefix + '[intervalRestarts]'] = currentProcess.intervalRestarts;
			}

			// Create the PM2 rollup metrics
			metrics['Component/rollup/all[uptime]'] = totalUptime;
			metrics['Component/rollup/all[restarts]'] = totalRestarts;
			metrics['Component/rollup/all[cpu]'] = totalCpu;
			metrics['Component/rollup/all[memory]'] = totalMemory;
			metrics['Component/rollup/all[intervalRestarts]'] = totalIntervalRestarts;
	
			// console.log(msg.components[0]);
			postToNewRelic(msg);

			// Disconnect from PM2
			pm2.disconnect();
		});
	});

	// Re-run every 30s
	setTimeout(poll, 30000)
}

function postToNewRelic(msg) {
	var msgString = JSON.stringify(msg);
	// console.log(msg.components[0].metrics);
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

console.log('Starting PM2 Plugin version: ' + ver);
poll();
