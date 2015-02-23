var misc = require('./misc');
var AssertionErrror = require('./errors').AssertionErrror;


function Source(config) {
	var lowConfig = new misc.LowPropertiesObject(config);

	var logGroup = lowConfig.get('LogGroup');
	this.LogGroup = misc.assert.isNotNull('LogGroup', logGroup) && 
					misc.assert.isOfType('LogGroup', 'string', logGroup);

	this.EndTime = lowConfig.get('EndTime');
	this.StartTime = lowConfig.get('StartTime') || new Date().getTime();
	this.LogStreamPRefix = lowConfig.get('LogStreamPrefix') || '';
	this.PollInterval = lowConfig.get('PollInterval') || 1000;
};

exports.Source = Source;
