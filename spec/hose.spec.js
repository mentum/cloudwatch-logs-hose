var hose = require('../index');

describe('Hose', function() {

	describe('Source', function() {

		describe('Constructor', function() {

			it('Requires LogGroup to be defined', function() {
				var test = function() {
					new hose.Source();
				};

				expect(test).toThrow();
			})

			it('Requires LogGroup to be a string', function() {
				var test = function() {
					new hose.Source({ LogGroup: 1 });
				};

				expect(test).toThrow();
			})

			it('Requires only LogGroup', function() {
				var test = function() {
					new hose.Source({LogGroup: ''});
				}

				expect(test).not.toThrow();
			})

		})

	})

})
