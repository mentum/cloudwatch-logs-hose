var misc = require('../misc');

describe('LowPropertiesObject', function() {

	it('Lowerize properties', function() {
		var obj = { A : '1', b: '2', sEe: '3' };
		var lowObj = new misc.LowPropertiesObject(obj);
		var names = Object.getOwnPropertyNames(lowObj);

		expect(names).toContain('a');
		expect(names).toContain('b');
		expect(names).toContain('see');
	});

	it('get is case insensitive', function() {
		var obj = { rOcKeT: 'HELLO' };
		var lowObj = new misc.LowPropertiesObject(obj);
		
		expect(lowObj.get('ROCKET')).toBe('HELLO');
	});

});
