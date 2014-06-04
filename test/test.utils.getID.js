var assert = chai.assert;

describe('utils', function() {
	describe('#getID()', function() {
		var getID = hyryx.utils.getID;

		it('should always be structured like timestamp#Object', function() {
			assert.match(getID(), /[0-9]{13}#Object/);
		});

		it('should return a customized ID for a given object type', function() {
			assert.match(getID('Array'), /[0-9]{13}#Array/);
		});

		it('should never be untyped', function() {
			assert.match(getID(''), /[0-9]{13}#Object/);
		});
	});
});