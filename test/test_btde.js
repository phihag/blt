'use strict';

const assert = require('assert');

const btde = require('../src/btde');

describe('btde', () => {
	it('basic parsing', () => {
		const str = '0~3~4~TV Refrath~1.BC Beuel|1~0~~HGHGG~G~Magee, Sam/Völker, Jan Colin~Briggs, Peter/Hess, Daniel~11~8~11~6~8~8~11~4~11~11|2~0~~HHH00~H~Nelte, Carla/Magee, Chloe~Pohl, Hannah/Kaminski, Lisa~13~11~11~~~11~3~3~~|3~0~~GHGHH~H~Schwenger, Max/Beck, Raphael~Weißkirchen, Max/Resch, Lukas~7~11~8~11~11~11~5~11~9~5|4~0~~GGHHG~G~Magee, Joshua~Goh, Giap Chin~6~7~11~11~3~11~11~9~6~11|5~0~~HHH00~H~Sandorhazi, Vivien~Kaminski, Lisa~11~11~11~~~5~1~8~~|6~2~~HGHGG~G~Nelte, Carla/Magee, Sam~Pohl, Hannah/Briggs, Peter~11~6~12~9~9~7~11~10~11~11|7~1~~GHGG0~G~Beck, Raphael~Weißkirchen, Max~13~11~6~3~~15~7~11~11~|1553292611';

		assert.deepStrictEqual(btde._parse(str), {
			team_names: ['TV Refrath', '1.BC Beuel'],
			mscore: [3, 4],
			scoring: '5x11_15^90',
			matches: [{
				name: 'HD1',
				players: [[
					{name: 'Sam Magee'},
					{name: 'Jan Colin Völker'},
				], [
					{name: 'Peter Briggs'},
					{name: 'Daniel Hess'},
				]],
				score: [[11, 8], [8, 11], [11, 4], [6, 11], [8, 11]],
			}, {
				name: 'DD',
				players: [[
					{name: 'Carla Nelte'},
					{name: 'Chloe Magee'},
				], [
					{name: 'Hannah Pohl'},
					{name: 'Lisa Kaminski'},
				]],
				score: [[13, 11], [11, 3], [11, 3]],
			}, {
				name: 'HD2',
				players: [[
					{name: 'Max Schwenger'},
					{name: 'Raphael Beck'},
				], [
					{name: 'Max Weißkirchen'},
					{name: 'Lukas Resch'},
				]],
				score: [[7, 11], [11, 5], [8, 11], [11, 9], [11, 5]],
			}, {
				name: 'HE1',
				players: [[
					{name: 'Joshua Magee'},
				], [
					{name: 'Giap Chin Goh'},
				]],
				score: [[6,11], [7,11], [11,9], [11,6], [3,11]],
			}, {
				name: 'DE',
				players: [[
					{name: 'Vivien Sandorhazi'},
				], [
					{name: 'Lisa Kaminski'},
				]],
				score: [[11, 5], [11, 1], [11, 8]],
			}, {
				name: 'GD',
				players: [[
					{name: 'Carla Nelte'},
					{name: 'Sam Magee'},
				], [
					{name: 'Hannah Pohl'},
					{name: 'Peter Briggs'},
				]],
				score: [[11, 7], [6, 11], [12, 10], [9, 11], [9, 11]],
			}, {
				name: 'HE2',
				players: [[
					{name: 'Raphael Beck'},
				], [
					{name: 'Max Weißkirchen'},
				]],
				score: [[13, 15], [11, 7], [6, 11], [3, 11]],
			}],
		});
	});

	it('parse empty match', () => {
		const str = '0~0~0~TV Refrath 2~BC Hohenlimburg|1~0~~00000~~~~~~~~~~~~~|2~0~~00000~~~~~~~~~~~~~|3~0~~00000~~~~~~~~~~~~~|4~0~~00000~~~~~~~~~~~~~|5~0~~00000~~~~~~~~~~~~~|6~0~~00000~~~~~~~~~~~~~|7~0~~00000~~~~~~~~~~~~~|1553294840';

		assert.deepStrictEqual(btde._parse(str), {
			team_names: ['TV Refrath 2', 'BC Hohenlimburg'],
			scoring: '5x11_15^90',
			mscore: [0, 0],
			matches: [{
				name: 'HD1',
				score: [],
			}, {
				name: 'DD',
				score: [],
			}, {
				name: 'HD2',
				score: [],
			}, {
				name: 'HE1',
				score: [],
			}, {
				name: 'DE',
				score: [],
			}, {
				name: 'GD',
				score: [],
			}, {
				name: 'HE2',
				score: [],
			}],
		});
	});
});
