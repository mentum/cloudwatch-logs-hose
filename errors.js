var util = require('util');

function AssertionError(message) { 
	Error.call(this);
	this.message = message;
}

util.inherits(AssertionError, Error);

exports = {
	AssertionError: AssertionError
};
