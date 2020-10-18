'use strict';

const fs = require('fs');
const path = require('path');

const render = require('./render');
const {team_data} = require('./data');
const {async_render} = require('./render');

const ROOT_DIR = path.dirname(__dirname);


async function overview_handler(req, res) {
	await async_render(req, res, 'admin_overview', {
		teammatches,
	});
}

async function override_handler(req, res) {
	
}

module.exports = {
	overview_handler,
	override_handler,
};
