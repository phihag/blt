'use strict';

const assert = require('assert');

const state_handler = require('../src/state_handler');
const utils = require('../src/utils');

describe('state_handler', () => {
	it('determine_diff', () => {
		const ev1 = {
			id: 'test:foo bar',
			num: 1,
		};
		const ev2 = utils.deep_copy(ev1);

		assert(! state_handler.determine_diff(ev1, ev2));

		ev1.matches = [];
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		ev2.matches = [];
		assert(!state_handler.determine_diff(ev1, ev2));

		ev1.team_names = ['TV Refrath', 'BV Gifhorn'];
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		ev2.team_names = ['TV Refrath', 'BC Hohenlimburg'];
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		ev2.team_names = ['TV Refrath', 'BV Gifhorn'];
		assert(!state_handler.determine_diff(ev1, ev2));

		ev2.num = 23;
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		ev1.num = 23;
		assert(! state_handler.determine_diff(ev1, ev2));

		const de = {
			name: 'DE',
			players: [
				[{name: 'Chloe Magee'}],
				[{name: 'Fabienne Deprez'}],
			],
			score: [],
		};
		ev1.matches.push(de);
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		ev2.matches.push(utils.deep_copy(de));
		assert(!state_handler.determine_diff(ev1, ev2));

		de.players[0][0].name = 'Yvonne Li';
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		de.players[0][0].name = 'Chloe Magee';
		assert(!state_handler.determine_diff(ev1, ev2));

		const hd = {
			name: 'HD1',
			players: [
				[{name: 'Kai Waldenberger'}, {name: 'Joshua Magee'}],
				[{name: 'Maurice Niesner'}, {name: 'Flandy Limperle'}],
			],
			score: [],
			serving: 0,
		};
		ev1.matches.push(hd);
		assert(state_handler.determine_diff(ev1, ev2) === 'full');

		ev2.matches.push(utils.deep_copy(hd));
		assert(!state_handler.determine_diff(ev1, ev2));

		ev2.matches[1].score = [[1, 0]];
		assert.deepStrictEqual(
			state_handler.determine_diff(ev1, ev2),
			[{type: 'score', num: 23, name: 'HD1', score: [[1, 0]], serving: 0}]);

		ev1.matches[1].score = [[1, 0]];
		assert(!state_handler.determine_diff(ev1, ev2));

		ev2.matches[0].score = [[2, 2]];
		ev2.matches[0].serving = 1;
		ev2.matches[1].serving = 1;
		assert.deepStrictEqual(
			state_handler.determine_diff(ev1, ev2),
			[
				{type: 'score', num: 23, name: 'DE', score: [[2, 2]], serving: 1},
				{type: 'score', num: 23, name: 'HD1', score: [[1, 0]], serving: 1},
			]);
	});
});
