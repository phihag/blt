'use strict';

const assert = require('assert');
const async = require('async');
const fs = require('fs');
const path = require('path');

const extradata = require('../static/extradata');

describe('extradata', () => {
	it('shortname', () => {
		assert.strictEqual(extradata.shortname('SV Fun-Ball Dortelweil'), 'Dortelweil');
		assert.strictEqual(extradata.shortname('1.BC Beuel'), 'Beuel');
		assert.strictEqual(extradata.shortname('1.BV Mülheim'), 'BVMülheim');
		assert.strictEqual(extradata.shortname('VfB GW Mülheim'), 'GWMülheim');
		assert.strictEqual(extradata.shortname('SC Union Lüdinghausen'), 'Lüdinghausen');
		assert.strictEqual(extradata.shortname('1.BC Sbr.-Bischmisheim'), 'Bischmisheim');
		assert.strictEqual(extradata.shortname('TSV Trittau'), 'Trittau');
		assert.strictEqual(extradata.shortname('TV Refrath'), 'Refrath');
		assert.strictEqual(extradata.shortname('TSV Neuhausen-Nymphenburg'), 'Neuhausen');
		assert.strictEqual(extradata.shortname('1.BC Wipperfeld'), 'Wipperfeld');
		assert.strictEqual(extradata.shortname('TSV 1906 Freystadt'), 'Freystadt');
		assert.strictEqual(extradata.shortname('TSV Trittau 2'), 'Trittau2');
		assert.strictEqual(extradata.shortname('Blau-Weiss Wittorf-NMS'), 'Wittorf');
		assert.strictEqual(extradata.shortname('Hamburg Horner TV'), 'HornerTV');
		assert.strictEqual(extradata.shortname('Horner TV'), 'HornerTV');
		assert.strictEqual(extradata.shortname('TV Refrath 2'), 'Refrath2');
		assert.strictEqual(extradata.shortname('1.BC Beuel 2'), 'Beuel2');
		assert.strictEqual(extradata.shortname('VfB/SC Peine'), 'Peine');
		assert.strictEqual(extradata.shortname('1.BV Mülheim 2'), 'BVMülheim2');
		assert.strictEqual(extradata.shortname('BC Hohenlimburg'), 'Hohenlimburg');
		assert.strictEqual(extradata.shortname('SG EBT Berlin'), 'Berlin');
		assert.strictEqual(extradata.shortname('STC Blau-Weiss Solingen'), 'Solingen');
		assert.strictEqual(extradata.shortname('1.BC Sbr.-Bischmisheim 2'), 'Bischmisheim2');
		assert.strictEqual(extradata.shortname('TV 1884 Marktheidenfeld'), 'Marktheidenfeld');
		assert.strictEqual(extradata.shortname('TV Dillingen'), 'Dillingen');
		assert.strictEqual(extradata.shortname('SV GutsMuths Jena'), 'Jena');
		assert.strictEqual(extradata.shortname('TuS Wiebelskirchen'), 'Wiebelskirchen');
		assert.strictEqual(extradata.shortname('TSV Neubiberg/Ottobrunn 1920'), 'Neubiberg');
		assert.strictEqual(extradata.shortname('BSpfr. Neusatz'), 'Neusatz');
		assert.strictEqual(extradata.shortname('SG Schorndorf'), 'Schorndorf');
		assert.strictEqual(extradata.shortname('VfB Friedrichshafen'), 'Friedrichshafen');
		assert.strictEqual(extradata.shortname('SV Fischbach'), 'Fischbach');
		assert.strictEqual(extradata.shortname('Spvgg.Sterkrade-N.'), 'Sterkrade');
	});

	const expect_logos = {
		'SV Fun-Ball Dortelweil': 'svfunballdortelweil',
		'1.BC Beuel': 'bcbeuel',
		'1.BV Mülheim': 'bvmuelheim',
		'VfB GW Mülheim 1': 'vfbgwmuelheim',
		'SC Union Lüdinghausen': 'unionluedinghausen',
		'1.BC Sbr.-Bischmisheim': 'bcbsaarbruecken',
		'TSV Trittau': 'tsvtrittau',
		'TV Refrath': 'tvrefrath',
		'TSV Neuhausen-Nymphenburg': 'tsvneuhausen',
		'1.BC Wipperfeld': 'bcwipperfeld',
		'TSV 1906 Freystadt': 'tsvfreystadt',
		'TSV Trittau 2': 'tsvtrittau',
		'Blau-Weiss Wittorf-NMS': 'wittorfneumuenster',
		'Hamburg Horner TV': 'hamburghornertv',
		'TV Refrath 2': 'tvrefrath',
		'1.BC Beuel 2': 'bcbeuel',
		'VfB/SC Peine': 'vfbscpeine',
		'1.BV Mülheim 2': 'bvmuelheim',
		'BC Hohenlimburg': 'bchohenlimburg',
		'SG EBT Berlin': 'sgebtberlin',
		'STC Blau-Weiss Solingen': 'stcblauweisssolingen',
		'1.BC Sbr.-Bischmisheim 2': 'bcbsaarbruecken',
		'TV 1884 Marktheidenfeld': 'tvmarktheidenfeld',
		'TV Dillingen': 'tvdillingen',
		'SV GutsMuths Jena': 'svgutsmuthsjena',
		'TuS Wiebelskirchen': 'tuswiebelskirchen',
		'TSV Neubiberg/Ottobrunn 1920': 'tsvneubibergottobrunn',
		'BSpfr. Neusatz': 'bspfrneusatz',
		'SG Schorndorf': 'sgschorndorf',
		'VfB Friedrichshafen': 'vfbfriedrichshafen',
		'SV Fischbach': 'svfischbach',
		'Spvgg.Sterkrade-N.': 'sterkrade',
	};

	it('logo associations', function() {
		assert(!extradata.team_logo('FoOBAR', false));

		for (const team_name in expect_logos) {
			const logo_name = expect_logos[team_name];
			assert.deepStrictEqual(
				extradata.team_logo(team_name),
				'logos/' + logo_name + '.svg');
		}
	});

	it('logo files present', function(done) {
		const logo_names = Object.values(expect_logos);
		const root_dir = path.dirname(__dirname);

		async.each(logo_names, function(logo_name, cb) {
			const rel_fn = path.join('static', 'logos', logo_name + '.svg');
			const logo_fn = path.join(root_dir, rel_fn);
			fs.stat(logo_fn, function(err, stat) {
				if (err) {
					return cb(err);
				}
				assert(stat.size > 100);
				cb();
			});
		}, done);
	});
});
