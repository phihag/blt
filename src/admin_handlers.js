'use strict';

const bcrypt = require('bcrypt');
const express = require('express');
const fs = require('fs');
const path = require('path');

const render = require('./render');
const {team_data} = require('./data');
const {async_render} = require('./render');

const {async_express_handler} = require('./utils');

const ROOT_DIR = path.dirname(__dirname);


async function overview_handler(req, res) {
	await async_render(req, res, 'admin_overview', {});
}

async function override_handler(req, res) {
	// TODO
}

async function make_authentication_middleware(cfg) {
	async function middleware(req, res, next) {
		const b64auth = (req.headers.authorization || '').split(' ')[1] || ''
		const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':')

		if (login && password) {
			const admin_accounts = cfg('admin_accounts', []);
			for (const {user, password_hash} of admin_accounts) {
				if (login !== user) continue;

				const result = await bcrypt.compare(password, password_hash);
				if (result === true) {
					next();
					return;
				}
			}
		}

		// Access denied...
		res.set('WWW-Authenticate', 'Basic realm="401"');
		res.status(401).send('Authentication required.');
	}

	return middleware;
}

async function setup(cfg, app) {
	const router = express.Router()
	router.use(await make_authentication_middleware(cfg))
	app.use('/admin/', router);
	router.get('/', async_express_handler(overview_handler));
	router.post('/override', async_express_handler(override_handler));
}

module.exports = {
	setup,
};
