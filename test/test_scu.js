'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const scu = require('../src/scu');

describe('scu (Lüdinghausen) source', () => {
	it('basic parsing', (done) => {
		fs.readFile(path.join(__dirname, 'testdata', 'scu1.html'), (err, html) => {
			if (err) return done(err);

			assert.deepStrictEqual(scu._parse(html), {
				team_names: ['SC Union 08 Lüdinghausen', 'TSV Trittau'],
				mscore: [3, 4],
				scoring: '5x11_15^90',
				matches: [{
					name: 'HD1',
					players: [[
						{name: 'Zurwonne'},
						{name: 'Blair'},
					], [
						{name: 'Persson'},
						{name: 'Trisnato'},
					]],
					score: [[11, 7], [11, 7], [8, 11], [13, 15], [10, 12]],
				}, {
					name: 'DD',
					players: [[
						{name: 'Li'},
						{name: 'Schnaase'},
					], [
						{name: 'Ostermeyer'},
						{name: 'Tabeling'},
					]],
					score: [[9, 11], [10, 12], [8, 11]],
				}, {
					name: 'HE1',
					players: [[
						{name: 'Tan'},
					], [
						{name: 'Westerbäk'},
					]],
					score: [[8, 11], [11, 2], [11, 8], [14, 12]],
				}, {
					name: 'HE2',
					players: [[
						{name: 'Fransman'},
					], [
						{name: 'Kämnitz'},
					]],
					score: [[11, 7], [11, 8], [11, 4]],
				}, {
					name: 'DE',
					players: [[
						{name: 'Li'},
					], [
						{name: 'Siahaya'},
					]],
					score: [[5, 11], [11, 8], [6, 11], [6, 11]],
				}, {
					name: 'GD',
					players: [[
						{name: 'Blair'},
						{name: 'Schnaase'},
					], [
						{name: 'Tabeling'},
						{name: 'Persson'},
					]],
					score: [[7, 11], [6, 11], [11, 9], [4, 11]],
				}, {
					name: 'HD2',
					players: [[
						{name: 'Bosch'},
						{name: 'Fransman'},
					], [
						{name: 'Bochat'},
						{name: 'Persson'},
					]],
					score: [[14, 12], [11, 4], [12, 10]],
				}],
			});

			done();
		});
	});

	it('real example', (done) => {
		fs.readFile(path.join(__dirname, 'testdata', 'scu2.html'), (err, html) => {
			if (err) return done(err);

			assert.deepStrictEqual(scu._parse(html), {
				team_names: ['SC Union 08 Lüdinghausen', 'TSV Neuhausen-Nymphenburg'],
				mscore: [0, 0],
				scoring: '5x11_15^90',
				matches: [{
					name: 'HD1',
					players: [[
						{name: 'Zurwonne'},
						{name: 'Blair'},
					], [
						{name: 'Test'},
						{name: 'Test'},
					]],
					score: [],
				}, {
					name: 'DD',
					players: [[
						{name: 'Li'},
						{name: 'Schnaae'},
					], [
						{name: 'Test'},
						{name: 'Test'},
					]],
					score: [],
				}, {
					name: 'HE1',
					players: [[
						{name: 'Tan'},
					], [
						{name: 'Test'},
					]],
					score: [],
				}, {
					name: 'HE2',
					players: [[
						{name: 'Fransman'},
					], [
						{name: 'Test'},
					]],
					score: [],
				}, {
					name: 'DE',
					players: [[
						{name: 'Li'},
					], [
						{name: 'Test'},
					]],
					score: [],
				}, {
					name: 'GD',
					players: [[
						{name: 'Blair'},
						{name: 'Schnaase'},
					], [
						{name: 'Test'},
						{name: 'Test'},
					]],
					score: [],
				}, {
					name: 'HD2',
					players: [[
						{name: 'Bosch'},
						{name: 'Fransman'},
					], [
						{name: 'Test'},
						{name: 'Test'},
					]],
					score: [],
				}],
			});

			done();
		});
	});
});
