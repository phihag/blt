'use strict';

const assert = require('assert');
const async = require('async');
const fs = require('fs');
const path = require('path');


const csde = require('../src/csde');
const utils = require('../src/utils');

const TESTDATA_DIR = path.join(__dirname, 'testdata');

function _read(basename, cb) {
	const fn = path.join(TESTDATA_DIR, basename);
	fs.readFile(fn, {encoding: 'utf8'}, cb);
}


function read_testcases(callback) {
	fs.readdir(TESTDATA_DIR, (err, files) => {
		if (err) return callback(err);

		const basenames = [];
		for (const filename of files) {
			const m = /^(cs[0-9]+)\.xml$/.exec(filename);
			if (! m) {
				continue;
			}

			const basename = m[1];
			assert(basename);
			basenames.push(basename);
		}

		async.map(basenames, (basename, cb) => {
			_read(basename + '.xml', (err, input_xml) => {
				if (err) return cb(err);

				_read(basename + '.json', (err, expected_json) => {
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
		run(); // If this says "run is not a function", you need to call mocha with --delay
	});

	it('inactive ticker', () => {
		const str = '<DATEN><STATUS>aus</STATUS></DATEN>';
		const ev = csde._parse(str);
		assert.deepStrictEqual(ev, {});

		const url = 'http://courtspot.de/php__Skripte/liveabfrage.php?l=1&v=9&g=8';
		const params = utils.parse_querystring(url);
		csde._annotate(ev, params);
		assert.deepStrictEqual(ev, {
			team_names: ['TSV 1906 Freystadt', 'Blau-Weiss Wittorf-NMS'],
			scoring: '5x11_15^90',
			mscore: [0, 0],
		});
	});

	it('annotate', () => {
		const ev = {
			matches: [],
		};
		const url = 'http://courtspot.de/php__Skripte/liveabfrage.php?l=2&v=14&g=18';
		const params = utils.parse_querystring(url);
		csde._annotate(ev, params);
		assert.deepStrictEqual(ev, {
			team_names: ['STC BW Solingen', 'BC Hohenlimburg'],
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
			v: 5,
			g: 1,
		};
		csde._annotate(ev, params);
		assert.deepStrictEqual(ev, {
			team_names: ev.team_names,
			scoring: '3x21',
			mscore: [2, 1],
			matches,
		});
	});

	it('error', (done) => {
		_read('csde.error', (err, html) => {
			if (err) return done(err);

			assert.deepStrictEqual(csde._parse(html), {
				error_msg: 'CourtSpot nicht erreichbar',
			});
			done();
		});
	});

	it('invalid XML', () => {
		const invalid_xml = '<</foo>';
		assert.deepStrictEqual(csde._parse(invalid_xml), {
			error_msg: 'Ungültiges XML in CourtSpot-Status',
		});

		const only_text = 'xxx';
		assert.deepStrictEqual(csde._parse(only_text), {
			error_msg: 'CourtSpot-Status fehlt',
		});

		const closing_xml = '</foo></bar></foo>';
		assert.deepStrictEqual(csde._parse(closing_xml), {
			error_msg: 'CourtSpot-Status fehlt',
		});
	});

/*
TODO: disabled for now
	it('updating', (done) => {
		async.parallel([
			cb => _read('cs_up_start.xml', cb),
			cb => _read('cs_up_7_8.xml', cb),
			cb => _read('cs_up_9_8.xml', cb),
		], (err, args) => {
			if (err) return done(err);

			const [base_xml, up78_xml, up98_xml] = args;

			const base_ev = csde._parse(base_xml);
			assert.deepStrictEqual(base_ev, {
				matches: [{
					name: 'HD1',
					players: [],
				}, {
					name: 'DD',
					players: [],
				}, {
					name: 'HD2',
					players: [],
				}, {
					name: 'HE1',
					players: [],
				}, {
					name: 'DE',
					players: [],
				}, {
					name: 'GD',
					players: [],
				}, {
					name: 'HE2',
					players: [],
				}],
				ticker_state: {
					n: '7',
					s: '8',
				},
			});

			// TODO update to n changed
			// TODO update to s changed
			// TODO update totally unchanged
			// TODO first request is partial already, should raise an error

		});
	});
*/
});
