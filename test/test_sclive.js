'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const sclive = require('../src/sclive');

describe('sclive (shuttlecock-live.com)', () => {
	it('basic parsing', () => {
		const data_json = '{"games": [{"field": -1, "id": 71, "name": "1. Herreneinzel", "player_a": "Max Wei\u00dfkirchen", "player_b": "Tobias Wadenka", "sets": [[351, 1, [6, 11]], [352, 2, [11, 8]], [353, 3, [11, 3]], [354, 4, [2, 11]], [355, 5, [11, 9]]]}, {"field": -1, "id": 72, "name": "2. Herreneinzel", "player_a": "Lukas Resch", "player_b": "Yankov Krasimir", "sets": [[356, 1, [7, 11]], [357, 2, [7, 11]], [358, 3, [6, 11]], [359, 4, [0, 0]], [360, 5, [0, 0]]]}, {"field": -1, "id": 73, "name": "Dameneinzel", "player_a": "Luise Heim", "player_b": "Natalya Voytsekh", "sets": [[361, 1, [5, 11]], [362, 2, [11, 6]], [363, 3, [6, 11]], [364, 4, [11, 8]], [365, 5, [4, 11]]]}, {"field": -1, "id": 74, "name": "1. Herrendoppel", "player_a": "Max Wei\u00dfkirchen<br/>Raphael Beck", "player_b": "Yankov Krasimir<br/>Przemyskaw Szydlowski", "sets": [[366, 1, [11, 7]], [367, 2, [11, 8]], [368, 3, [10, 12]], [369, 4, [11, 8]], [370, 5, [0, 0]]]}, {"field": -1, "id": 75, "name": "2. Herrendoppel", "player_a": "Patrick MacHugh<br/>Daniel Hess", "player_b": "Tobias Wadenka<br/>Manuel Heumann", "sets": [[371, 1, [6, 11]], [372, 2, [6, 11]], [373, 3, [11, 4]], [374, 4, [6, 11]], [375, 5, [0, 0]]]}, {"field": -1, "id": 76, "name": "Gemischtes Doppel", "player_a": "Raphael Beck<br/>Eva Janssens", "player_b": "Manuel Heumann<br/>Kaja Stankovic", "sets": [[376, 1, [11, 5]], [377, 2, [11, 7]], [378, 3, [14, 12]], [379, 4, [0, 0]], [380, 5, [0, 0]]]}, {"field": -1, "id": 77, "name": "Damendoppel", "player_a": "Birgit Overzier<br/>Eva Janssens", "player_b": "Natalya Voytsekh<br/>Kaja Stankovic", "sets": [[381, 1, [7, 11]], [382, 2, [11, 6]], [383, 3, [11, 13]], [384, 4, [8, 11]], [385, 5, [0, 0]]]}], "result": [3, 4], "team_a": "1. BC Beuel", "team_b": "TSV Neuhausen-Nymphenburg"}';

		assert.deepStrictEqual(sclive._parse(data_json), {
			team_names: ['1.BC Beuel', 'TSV Neuhausen-Nymphenburg'],
			mscore: [3, 4],
			scoring: '5x11_15^90',
			matches: [{
				name: 'HE1',
				players: [[
					{name: 'Max Weißkirchen'},
				], [
					{name: 'Tobias Wadenka'},
				]],
				score: [[6, 11], [11, 8], [11, 3], [2, 11], [11, 9]],
			}, {
				name: 'HE2',
				players: [[
					{name: 'Lukas Resch'},
				], [
					{name: 'Yankov Krasimir'},
				]],
				score: [[7, 11], [7, 11], [6, 11]],
			}, {
				name: 'DE',
				players: [[
					{name: 'Luise Heim'},
				], [
					{name: 'Natalya Voytsekh'},
				]],
				score: [[5, 11], [11, 6], [6, 11], [11, 8], [4, 11]],
			}, {
				name: 'HD1',
				players: [[
					{name: 'Max Weißkirchen'},
					{name: 'Raphael Beck'},
				], [
					{name: 'Yankov Krasimir'},
					{name: 'Przemyskaw Szydlowski'},
				]],
				score: [[11, 7], [11, 8], [10, 12], [11, 8]],
			}, {
				name: 'HD2',
				players: [[
					{name: 'Patrick MacHugh'},
					{name: 'Daniel Hess'},
				], [
					{name: 'Tobias Wadenka'},
					{name: 'Manuel Heumann'},
				]],
				score: [[6, 11], [6, 11], [11, 4], [6, 11]],
			}, {
				name: 'GD',
				players: [[
					{name: 'Raphael Beck'},
					{name: 'Eva Janssens'},
				], [
					{name: 'Manuel Heumann'},
					{name: 'Kaja Stankovic'},
				]],
				score: [[11, 5], [11, 7], [14, 12]],
			}, {
				name: 'DD',
				players: [[
					{name: 'Birgit Overzier'},
					{name: 'Eva Janssens'},
				], [
					{name: 'Natalya Voytsekh'},
					{name: 'Kaja Stankovic'},
				]],
				score: [[7, 11], [11, 6], [11, 13], [8, 11]],
			}],
		});
	});

	it('parsing with zeroes', () => {
		const data_json = '{"games": [{"field": -1, "id": 134, "name": "1. Herreneinzel", "player_a": "", "player_b": "", "sets": [[666, 1, [0, 0]], [667, 2, [0, 0]], [668, 3, [0, 0]], [669, 4, [0, 0]], [670, 5, [0, 0]]]}, {"field": -1, "id": 135, "name": "2. Herreneinzel", "player_a": "", "player_b": "", "sets": [[671, 1, [0, 0]], [672, 2, [0, 0]], [673, 3, [0, 0]], [674, 4, [0, 0]], [675, 5, [0, 0]]]}, {"field": -1, "id": 136, "name": "Dameneinzel", "player_a": "", "player_b": "", "sets": [[676, 1, [0, 0]], [677, 2, [0, 0]], [678, 3, [0, 0]], [679, 4, [0, 0]], [680, 5, [0, 0]]]}, {"field": -1, "id": 137, "name": "1. Herrendoppel", "player_a": "", "player_b": "", "sets": [[681, 1, [0, 0]], [682, 2, [0, 0]], [683, 3, [0, 0]], [684, 4, [0, 0]], [685, 5, [0, 0]]]}, {"field": -1, "id": 138, "name": "2. Herrendoppel", "player_a": "", "player_b": "", "sets": [[686, 1, [0, 0]], [687, 2, [0, 0]], [688, 3, [0, 0]], [689, 4, [0, 0]], [690, 5, [0, 0]]]}, {"field": -1, "id": 139, "name": "Gemischtes Doppel", "player_a": "", "player_b": "", "sets": [[691, 1, [0, 0]], [692, 2, [0, 0]], [693, 3, [0, 0]], [694, 4, [0, 0]], [695, 5, [0, 0]]]}, {"field": -1, "id": 140, "name": "Damendoppel", "player_a": "", "player_b": "", "sets": [[696, 1, [0, 0]], [697, 2, [0, 0]], [698, 3, [0, 0]], [699, 4, [0, 0]], [700, 5, [0, 0]]]}], "result": [0, 0], "team_a": "1. BC Beuel", "team_b": "TSV Freystadt"}';

		assert.deepStrictEqual(sclive._parse(data_json), {
			team_names: ['1.BC Beuel', 'TSV 1906 Freystadt'],
			mscore: [0, 0],
			scoring: '5x11_15^90',
			matches: [{
				name: 'HE1',
				players: [[
					{name: 'Max Weißkirchen'},
				], [
					{name: 'Tobias Wadenka'},
				]],
				score: [[6, 11], [11, 8], [11, 3], [2, 11], [11, 9]],
			}, {
				name: 'HE2',
				players: [[
					{name: 'Lukas Resch'},
				], [
					{name: 'Yankov Krasimir'},
				]],
				score: [[7, 11], [7, 11], [6, 11]],
			}, {
				name: 'DE',
				players: [[
					{name: 'Luise Heim'},
				], [
					{name: 'Natalya Voytsekh'},
				]],
				score: [[5, 11], [11, 6], [6, 11], [11, 8], [4, 11]],
			}, {
				name: 'HD1',
				players: [[
					{name: 'Max Weißkirchen'},
					{name: 'Raphael Beck'},
				], [
					{name: 'Yankov Krasimir'},
					{name: 'Przemyskaw Szydlowski'},
				]],
				score: [[11, 7], [11, 8], [10, 12], [11, 8]],
			}, {
				name: 'HD2',
				players: [[
					{name: 'Patrick MacHugh'},
					{name: 'Daniel Hess'},
				], [
					{name: 'Tobias Wadenka'},
					{name: 'Manuel Heumann'},
				]],
				score: [[6, 11], [6, 11], [11, 4], [6, 11]],
			}, {
				name: 'GD',
				players: [[
					{name: 'Raphael Beck'},
					{name: 'Eva Janssens'},
				], [
					{name: 'Manuel Heumann'},
					{name: 'Kaja Stankovic'},
				]],
				score: [[11, 5], [11, 7], [14, 12]],
			}, {
				name: 'DD',
				players: [[
					{name: 'Birgit Overzier'},
					{name: 'Eva Janssens'},
				], [
					{name: 'Natalya Voytsekh'},
					{name: 'Kaja Stankovic'},
				]],
				score: [[7, 11], [11, 6], [11, 13], [8, 11]],
			}],
		});
	});
});
