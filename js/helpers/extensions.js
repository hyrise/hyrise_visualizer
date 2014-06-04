// This file provides extended functionality for basic JavaScript data types
// borrowed from the prototypejs api. As long as highcharts are used, these
// workarounds have to be used, since the use of mootools inside highcharts
// prevents the use of prototypejs.
//
// String >>
//   capitalize
//
// Array >>
//   each
//   find
//   findAll
//   pluck
//   sortBy
//   select
//   compact
//   extend
//   invoke


// Basic implementation of inheritance for use with classes
function extend(superclass, mixin) {
	function f() {}
	f.prototype = Object.create(superclass.prototype);

	$.each(mixin, function(key, value) {
		f.prototype[key] = value;
	});

	return new f();
}



var $break = { };

String.prototype.capitalize = function() {
	return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
}

Array.prototype.each = function(iterator, context) {
	for (var i = 0, length = this.length >>> 0; i < length; i++) {
		if (i in this) iterator.call(context, this[i], i, this);
	}
}

Array.prototype.find = function detect(iterator, context) {
	var result;
	try {
		this.each(function(value, index) {
		  if (iterator.call(context, value, index, this)) {
			result = value;
			throw $break;
		  }
		}, this);		
	} catch (e) {
		if (e !== $break) {
			return;
		}
		return result;
	}
	return;
}

Array.prototype.findAll = function findAll(iterator, context) {
	var results = [];
	this.each(function(value, index) {
	if (iterator.call(context, value, index, this))
		results.push(value);
	}, this);
	return results;
};

Array.prototype.pluck = function pluck(property) {
	var results = [];
	this.each(function(value) {
		results.push(value[property]);
	});
	return results;
};

Array.prototype.sortBy = function sortBy(iterator, context) {
	return this.map(function(value, index) {
		return {
			value: value,
			criteria: iterator.call(context, value, index, this)
		};
	}, this).sort(function(left, right) {
		var a = left.criteria, b = right.criteria;
		return a < b ? -1 : a > b ? 1 : 0;
	}).pluck('value');
};

Array.prototype.select = function filter(iterator) {
	if (this == null || !(iterator instanceof Function))
		throw new TypeError();

		var object = Object(this);
		var results = [], context = arguments[1], value;

		for (var i = 0, length = object.length >>> 0; i < length; i++) {
			if (i in object) {
			value = object[i];
			if (iterator.call(context, value, i, object)) {
				results.push(value);
			}
		}
	}
	return results;
};

Array.prototype.compact = function compact() {
	return this.select(function(value) {
		return value != null;
	});
};

Array.prototype.invoke = function invoke(method) {
	var args = $A(arguments).slice(1);
	return this.map(function(value) {
		return value[method].apply(value, args);
	});
};

var _reduce = Array.prototype.reduce;
Array.prototype.inject = function inject(memo, iterator) {
	iterator = iterator;
	var context = arguments[2];
	// The iterator must be bound, as `Array#reduce` always binds to
	// `undefined`.
	return _reduce.call(this, iterator.bind(context), memo);
}

Array.prototype.flatten = function flatten() {
	return this.inject([], function(array, value) {
		if (value instanceof Array)
			return array.concat(value.flatten());
		array.push(value);
		return array;
	});
};