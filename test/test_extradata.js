'use strict';

const assert = require('assert');

const extradata = require('../static/extradata');

describe('extradata', () => {
	it('shortname', () => {
		assert.strictEqual(extradata.shortname('SV Fun-Ball Dortelweil'), 'Dortelweil');
		assert.strictEqual(extradata.shortname('1.BC Beuel'), 'Beuel');
		assert.strictEqual(extradata.shortname('1.BV Mülheim'), 'Mülheim');
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
		assert.strictEqual(extradata.shortname('TV Refrath 2'), 'Refrath2');
		assert.strictEqual(extradata.shortname('1.BC Beuel 2'), 'Beuel2');
		assert.strictEqual(extradata.shortname('VfB/SC Peine'), 'Peine');
		assert.strictEqual(extradata.shortname('1.BV Mülheim 2'), 'Mülheim2');
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
;	});
});
