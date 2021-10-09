#!/usr/bin/env node

const argparse = require('argparse');
const bcrypt = require('bcrypt');
const readline = require('readline');

const {promisify} = require('util');

const SALT_ROUNDS = 10;

async function main() {
	const parser = new argparse.ArgumentParser({
		description: 'Generate a password hash',
	});
	parser.addArgument('PASSWORD', {help: 'Secret password to hash. (Omit to be prompted)', nargs: '?'});
	const args = parser.parseArgs();

	let password = args.PASSWORD;
	if (!password) {
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout
		});

		password = await new Promise((resolve, _reject) => {
			return rl.question('Input password: ', resolve);
		});
		rl.close();
	}

	const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

	console.log('Copy to localconfig.json like this:\n');
	const INDENT = '\t';
	console.log(
		'"admin_accounts": [{\n' +
		`${INDENT}"user": "admin",\n` +
		`${INDENT}"password_hash": "${password_hash}"\n` +
		'}]'
	);
}


(async () => {
	try {
		await main();
	} catch (e) {
		console.error(e.stack);
		process.exit(2);
	}
})();
