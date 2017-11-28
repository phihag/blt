'use strict';

const assert = require('assert');

const eventutils = require('../src/eventutils');

describe('eventutils', () => {
	it('unify_name', () => {
		assert.strictEqual(eventutils.unify_name('1.HE'), 'HE1');
		assert.strictEqual(eventutils.unify_name('DE'), 'DE');
		assert.strictEqual(eventutils.unify_name('HD2'), 'HD2');
		assert.strictEqual(eventutils.unify_name('2.HD'), 'HD2');
		assert.strictEqual(eventutils.unify_name('3. HE'), 'HE3');
	});

	it('unify_order', () => {
		const matches = [
			{name: 'HD1'},
			{name: 'HD2'},
			{name: 'DD'},
			{name: 'DE'},
			{name: 'HE1'},
			{name: 'HE2'},
			{name: 'GD'},
		];
		eventutils.unify_order(matches, '1BL-2017');
		assert.deepStrictEqual(matches, [
			{name: 'HD1'},
			{name: 'DD'},
			{name: 'HD2'},
			{name: 'HE1'},
			{name: 'DE'},
			{name: 'GD'},
			{name: 'HE2'},
		]);
	});
});