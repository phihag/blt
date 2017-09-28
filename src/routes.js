'use strict';

const express = require('express');
const favicon = require('serve-favicon');
const path = require('path');

const root_handler = require('./root_handler');

function setup(cfg, app) {
	app.use('/static', express.static((cfg('production', false) ? 'dist/' : '') + 'static'));
	app.use(favicon(path.dirname(__dirname) + '/static/favicon.ico'));

	app.get('/', root_handler);
}

module.exports = {
	setup: setup,
};
