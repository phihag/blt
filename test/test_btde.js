'use strict';

const assert = require('assert');
const path = require('path');

const bup_tutils = require('../bup/test/tutils.js');
const btde = require('../src/btde');
const {read_json_async} = require('../src/utils');

async function btde_snapshot(snapshot_name, league_key) {
	const source_fn = path.join(__dirname, 'testdata', `${snapshot_name}.json`);
	const ticker_data = await read_json_async(source_fn);
	const parsed = btde._parse({league_key}, ticker_data);
	await bup_tutils.assert_snapshot(snapshot_name, parsed, {dirname: __dirname});
	return parsed;
}

describe('btde', () => {
	it('basic parsing', async () => {
		await btde_snapshot('btde_basic', '1BL-2020');
	});

	it('parse empty match', async () => {
		await btde_snapshot('btde_empty', '1BL-2020');
	});

	it('parse 8x 3x21 match', () => {
		// TODO
	});
});
