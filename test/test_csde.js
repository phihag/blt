'use strict';

const assert = require('assert');
const async = require('async');
const fs = require('fs');
const path = require('path');


const csde = require('../src/csde');
const utils = require('../src/utils');

const TESTDATA_DIR = path.join(__dirname, 'testdata');

function read_testcases(callback) {
	fs.readdir(TESTDATA_DIR, (err, files) => {
		if (err) return callback(err);

		const basenames = [];
		for (const filename of files) {
			const m = /^(cs[a-z0-9]+)\.xml$/.exec(filename);
			if (! m) {
				continue;
			}

			const basename = m[1];
			assert(basename);
			basenames.push(basename);
		}

		async.map(basenames, (basename, cb) => {
			const input_fn = path.join(TESTDATA_DIR, basename + '.xml');
			const expected_fn = path.join(TESTDATA_DIR, basename + '.json');

			fs.readFile(input_fn, {encoding: 'utf8'}, (err, input_xml) => {
				if (err) return cb(err);

				fs.readFile(expected_fn, {encoding: 'utf8'}, (err, expected_json) => {
					if (err) return cb(err);
					const expected = JSON.parse(expected_json);

					cb(null, {
						basename,
						input_xml,
						expected,
					});
				});
			});
		}, callback);
	});
}

describe('CourtSpot', () => {
	read_testcases((err, testcases) => {
		if (err) {
			throw err;
		}
		describe('demo cases', () => {
			for (const tc of testcases) {
				it(tc.basename, () => {
					const parsed = csde._parse(tc.input_xml);
					assert.deepStrictEqual(parsed, tc.expected);
				});
			}
		});
		run();
	});

	it('inactive ticker', () => {
		const str = '<DATEN><STATUS>aus</STATUS></DATEN>';
		const ev = csde._parse(str);
		assert.deepStrictEqual(ev, {});

		const url = 'http://courtspot.de/php__Skripte/liveabfrage.php?l=1&v=9&g=10';
		const params = utils.parse_querystring(url);
		csde._annotate(ev, params);
		assert.deepStrictEqual(ev, {
			team_names: ['TSV 1906 Freystadt', 'SV Fun-Ball Dortelweil'],
			id: 'csde:1-9-10',
			scoring: '5x11_15^90',
			mscore: [0, 0],
		});
	});

	it('annotate', () => {
		const ev = {
			matches: [],
		};
		const url = 'http://courtspot.de/php__Skripte/liveabfrage.php?l=2&v=12&g=20';
		const params = utils.parse_querystring(url);
		csde._annotate(ev, params);
		assert.deepStrictEqual(ev, {
			team_names: ['TV Refrath 2', 'VfB/SC Peine'],
			id: 'csde:2-12-20',
			scoring: '5x11_15^90',
			mscore: [0, 0],
			matches: [],
		});
	});

	it('annotate Regionalliga', () => {
		const matches = [{
			name: '1.HD',
			score: [[21, 5], [21, 3]],
		}, {
			name: '2.HD',
			score: [[21, 23], [21, 23]],
		}, {
			name: 'DD',
			score: [[21, 23], [29, 27], [1, 1]],
		}, {
			name: '1.HE',
			score: [[21, 23], [29, 27], [21, 1]],
		}];
		const ev = {
			matches,
		};
		const params = {
			l: 4,
			v: 2,
			g: 1,
		};
		csde._annotate(ev, params);
		assert.deepStrictEqual(ev, {
			team_names: ['BV Gifhorn 1', 'SG EBT Berlin 2'],
			id: 'csde:4-2-1',
			scoring: '3x21',
			mscore: [2, 1],
			matches,
		});
	});
});
