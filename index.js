var misc = require('./misc');
var AssertionErrror = require('./errors').AssertionErrror;
var AWS = require('aws-sdk');

function Source(config) {
	if(typeof config === 'undefined' || config === null) {
		throw new AssertionErrror('You must pass a configuration object.');
	}

	var lowConfig = new misc.LowPropertiesObject(config);

	var logGroup = lowConfig.get('LogGroup');
	this.LogGroup = misc.assert.isNotNull('LogGroup', logGroup) && 
					misc.assert.isOfType('LogGroup', 'string', logGroup);

	misc.assert.isNotNull('aws', config.aws) && misc.assert.isOfType('aws', 'object', config.aws);
	AWS.config = new AWS.Config(config.aws);

	this.EndTime = lowConfig.get('EndTime');
	this.StartTime = lowConfig.get('StartTime') || new Date().getTime();
	this.LogStreamPrefix = lowConfig.get('LogStreamPrefix') || '';
	this.PollInterval = lowConfig.get('PollInterval') || 1000;

	this.state = 'closed';
	this._onLogsSubscribers = [];
	this._onErrorSubscribers = [];

	this._streams = [];
	this._queuedStreams = [];
	this._latestStreamTimestamps = [];
	this._queuedEvents = [];
};

Source.prototype.isOpen = function() {
	return this.state === 'open';
};

Source.prototype.isClosed = function() {
	return this.state === 'closed';
};

Source.prototype.open = function() {
	if(this.isOpen()) return;

	this._cwLogs = new AWS.CloudWatchLogs({ apiVersion: '2015-03-01' });

	var self = this;

	this._hosePollId = setInterval(function() {
		self._pollLogStreams();
	}, this.PollInterval);

	this._hosePollId2 = setInterval(function() {
		while(self._queuedStreams.length > 0) {
			var el = self._queuedStreams.pop();
			self._pollLogStreamLogs(el);
		}
	}, this.PollInterval + 500);

	this.state = 'open';
};

Source.prototype.close = function() {
	if(this.isClosed()) return;

	clearInterval(this._hosePollId);
	clearInterval(this._hosePollId2);

	this.state = 'closed';
};

Source.prototype._pollLogStreams = function(nextToken) {
	var self = this;

	var params = {
		logGroupName: this.LogGroup,
		limit: 50
	};

	if(this.LogStreamPrefix.length >= 1) params.logStreamNamePrefix = this.LogStreamPrefix;
	if(typeof nextToken === 'string') params.nextToken = nextToken;

	this._cwLogs.describeLogStreams(params, function(err, data) {
		if(err) self._onPollFailed(err);
		else {
			if(typeof data.nextToken === 'string' && data.nextToken !== nextToken) {
				self._pollLogStreams(data.nextToken);
			}

			for(var i in data.logStreams) {
				var name = data.logStreams[i].logStreamName;
				var ingestion = data.logStreams[i].lastIngestionTime;

				if(typeof ingestion === 'undefined') 
					ingestion = data.logStreams[i].creationTime;

				if(!(name in self._streams)) {
					self._streams[name] = ingestion;
				} else if(self._streams[name] < ingestion) {
					self._streams[name] = ingestion;
					//if(ingestion >= self.StartTime) { // TODO Fix this to work with local time
						self._queuedStreams.push(name);	
					//}
				}
			}
		}
	});
};

Source.prototype._onPollFailed = function(err) {
	for(var i in this._onLogsSubscribers) {
		this._onErrorSubscribers[i](err);
	}
};

Source.prototype._pollLogStreamLogs = function(name, nextToken) {
	var self = this;
	var startTime = this.StartTime;

	if(this._latestStreamTimestamps[name] > startTime) 
		startTime = this._latestStreamTimestamps[name];

	var params = {
		logGroupName: this.LogGroup,
		logStreamName: name,
		startFromHead: true,
		startTime: startTime + 1
	};

	if(typeof nextToken === 'string') params.nextToken = nextToken;
	if(typeof this.EndTime === 'number') params.endTime = this.EndTime;

	this._cwLogs.getLogEvents(params, function(err, data) {
		if(err) self._onPollFailed(err);
		else {
			if(!(name in self._queuedEvents)) self._queuedEvents[name] = [];
			
			for(var i in data.events) {
				
				self._queuedEvents[name].push(data.events[i]);

				if(typeof self._latestStreamTimestamps[name] === 'undefined' || self._latestStreamTimestamps[name] < data.events[i].timestamp) {
					self._latestStreamTimestamps[name] = data.events[i].timestamp;
				}
			}

			if(typeof data.nextForwardToken === 'string' && data.nextForwardToken != nextToken) {
				self._pollLogStreamLogs(name, data.nextForwardToken);
			} else {
				for(var i in self._onLogsSubscribers) {
					self._onLogsSubscribers[i](self._queuedEvents[name]);
				}
				self._queuedEvents[name] = [];
			}
		}
	});
};

Source.prototype.on = function(event, fn) {
	if((typeof event === 'string') && event.toLowerCase() === 'logs') {
		this._onLogsSubscribers.push(fn);
	}

	if((typeof event === 'string') && event.toLowerCase() === 'error') {
		this._onErrorSubscribers.push(fn);
	}
};

exports.Source = Source;
