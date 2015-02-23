function LowPropertiesObject(obj) {
	var properties = Object.getOwnPropertyNames(obj);
	for(var i = 0; i < properties.length; i++) {
		this[properties[i].toLowerCase()] = obj[properties[i]];
	}
}

LowPropertiesObject.prototype.get = function(name) {
	return this[name.toLowerCase()];
}


var assert = { };
assert.isNotNull = function(name, value) {
	if(typeof value === 'undefined' || value == null) {
		throw new AssertionErrror('Expected ' + name + ' to be defined.');
	}
	return value;
};

assert.isOfType = function(name, type, value) {
	if((typeof value).toLowerCase() !== type.toLowerCase()) {
		throw new AssertionErrror('Expected ' + name + ' to be of type ' + type + ' but was ' + typeof(value));
	}
	return value;
};

exports.LowPropertiesObject = LowPropertiesObject;
exports.assert = assert;
