#!/usr/bin/env node

const assert = require('assert');
const argparse = require('argparse');
const fetch = require('node-fetch');

const utils = require('./src/utils');


async function main() {
	const parser = new argparse.ArgumentParser({
		description: 'Generate club IDs for CourtSpot, to be copied into csde.js',
	});
	parser.parseArgs();

	for (const league of [1, 2, 3, 4, 11, 12, 13]) {
		const response = await fetch(`https://courtspot.de/php__Skripte/getVereine.php?liga=${league}`);
		assert.equal(response.status, 200);
		const xml = await response.text();

		const [err_msg, doc] = utils.parseXML(xml);
		assert(!err_msg, `Failed to parse XML: ${err_msg}`);
		for (const el of Array.from(doc.getElementsByTagName('Verein'))) {
			let name = el.getElementsByTagName('Lang')[0].textContent;
			const name_m = /^(.*)\ 1$/.exec(name);
			if (name_m) {
				name = name_m[1];
			}

			const id = el.getElementsByTagName('Nummer')[0].textContent;
			console.log(`'${league}-${id}': '${name}',`);
		}
	}
}


(async () => {
    try {
        await main();
    } catch (e) {
        console.error(e.stack);
        process.exit(2);
    }
})();
