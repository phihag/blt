'use strict';

const assert = require('assert');

const btde = require('../src/btde');

describe('btde', () => {
	it('basic parsing', () => {
		const str = '0~3~4~TV Refrath~1.BC Beuel|1~0~~HGHGG~G~Magee, Sam/Völker, Jan Colin~Briggs, Peter/Hess, Daniel~11~8~11~6~8~8~11~4~11~11|2~0~~HHH00~H~Nelte, Carla/Magee, Chloe~Pohl, Hannah/Kaminski, Lisa~13~11~11~~~11~3~3~~|3~0~~GHGHH~H~Schwenger, Max/Beck, Raphael~Weißkirchen, Max/Resch, Lukas~7~11~8~11~11~11~5~11~9~5|4~0~~GGHHG~G~Magee, Joshua~Goh, Giap Chin~6~7~11~11~3~11~11~9~6~11|5~0~~HHH00~H~Sandorhazi, Vivien~Kaminski, Lisa~11~11~11~~~5~1~8~~|6~2~~HGHGG~G~Nelte, Carla/Magee, Sam~Pohl, Hannah/Briggs, Peter~11~6~12~9~9~7~11~10~11~11|7~1~~GHGG0~G~Beck, Raphael~Weißkirchen, Max~13~11~6~3~~15~7~11~11~|1553292611';

		assert.deepStrictEqual(btde._parse({league_key: '1BL-2020'}, str), {
			team_names: ['TV Refrath', '1.BC Beuel'],
			mscore: [3, 4],
			scoring: '5x11_15^90',
			courts: [
				{label: '1', match_id: 'HE2'},
				{label: '2', match_id: 'GD'}
			],
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
					{name: 'Sam Magee'},
					{name: 'Carla Nelte'},
				], [
					{name: 'Peter Briggs'},
					{name: 'Hannah Pohl'},
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

		assert.deepStrictEqual(btde._parse({league_key: '1BL-2020'}, str), {
			team_names: ['TV Refrath 2', 'BC Hohenlimburg'],
			courts: [
				{label: '1'},
				{label: '2'}
			],
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

	it('parse 8x 3x21 match', () => {
		const str = '0~0~0~Nationalmannschaft~Sterkrade|1~0~H~000~~Seidel, Marvin/Lamsfuß, Mark~Benny/Steffen~3~~~2~~|2~0~~~~Roth, Fabian/Zwiebler, Marc~Commander/David~~~~~~|3~0~~~~Efler, Linda/Küspert, Stine~Leona/Jessy~~~~~~|4~0~~~~Zwiebler, Marc~Benny~~~~~~|5~0~~~~Roth, Fabian~Commander~~~~~~|6~0~~~~Seidel, Marvin~David~~~~~~|7~0~G~HG0~~Li, Yvonne~Leona~21~15~3~15~21~7|8~1~G~000~~Herttrich, Isabel/Lamsfuß, Mark~Jessy/Steffen~4~~~5~~|1601706401';

		assert.deepStrictEqual(btde._parse({league_key: 'RLW-2016'}, str), {
			team_names: ['Nationalmannschaft', 'Sterkrade'],
			scoring: '3x21',
			mscore: [0, 0],
			matches: [{
				name: 'HD1',
				score: [[3, 2]],
				players: [
					[{name: 'Marvin Seidel'}, {name: 'Mark Lamsfuß'}],
					[{name: 'Benny'}, {name: 'Steffen'}],
				],
				serving: 0,
			}, {
				name: 'HD2',
				score: [],
				players: [
					[{name: 'Fabian Roth'}, {name: 'Marc Zwiebler'}],
					[{name: 'Commander'}, {name: 'David'}],
				],
			}, {
				name: 'DD',
				score: [],
				players: [
					[{name: 'Linda Efler'}, {name: 'Stine Küspert'}],
					[{name: 'Leona'}, {name: 'Jessy'}],
				],
			}, {
				name: 'HE1',
				score: [],
				players: [
					[{name: 'Marc Zwiebler'}],
					[{name: 'Benny'}]
				],
			}, {
				name: 'HE2',
				score: [],
				players: [
					[{name: 'Fabian Roth'}],
					[{name: 'Commander'}]
				],
			}, {
				name: 'HE3',
				score: [],
				players: [
					[{name: 'Marvin Seidel'}],
					[{name: 'David'}]
				],
			}, {
				name: 'DE',
				score: [[21, 15], [15, 21], [3, 7]],
				players: [
					[{name: 'Yvonne Li'}],
					[{name: 'Leona'}],
				],
				serving: 1,
			}, {
				name: 'GD',
				score: [[4, 5]],
				players: [
					[{name: 'Mark Lamsfuß'}, {name: 'Isabel Herttrich'}],
					[{name: 'Steffen'}, {name: 'Jessy'}],
				],
				serving: 1,
			}],
			courts: [
				{label: '1', match_id: 'GD'},
				{label: '2'}
			],
		});
	});
});
