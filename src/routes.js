'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

const web_handlers = require('./web_handlers');
const bup_handlers = require('./bup_handlers');

function setup(cfg, app) {
	app.use('/static', express.static((cfg('production', false) ? 'dist/' : '') + 'static'));
	app.use(favicon(path.dirname(__dirname) + '/static/favicon.ico'));

	app.get('/', web_handlers.root_handler);
	app.get('/events.json', web_handlers.json_handler);
	app.get('/embed.js', web_handlers.embed_handler);

	app.get('/bupdate', bup_handlers.bupdate_handler);
	app.use('/bup', express.static('bup'));
}


module.exports = {
	setup: setup,
};
