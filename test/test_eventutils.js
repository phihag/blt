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

	it('unify_team_name', () => {
		assert.strictEqual(eventutils.unify_team_name('STC BW Solingen'), 'STC Blau-Weiss Solingen');
		assert.strictEqual(eventutils.unify_team_name('OSC Düsseldorf'), 'OSC Düsseldorf');
		assert.strictEqual(eventutils.unify_team_name('BC Phönix Hövelhof 1'), 'BC Phönix Hövelhof');
		assert.strictEqual(eventutils.unify_team_name('TSV Neuhausen-Nymphenb. München 2'), 'TSV Neuhausen-Nymphenburg München 2');
		assert.strictEqual(eventutils.unify_team_name('TSV Neuhausen-Nymphenburg 3'), 'TSV Neuhausen-Nymphenburg München 3');
		assert.strictEqual(eventutils.unify_team_name('Blau-Weiss Wittorf NMS'), 'Blau-Weiss Wittorf');
		assert.strictEqual(eventutils.unify_team_name('Blau-Weiss Wittorf-NMS'), 'Blau-Weiss Wittorf');
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
		eventutils.unify_order(matches, '1BL-2020');
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
