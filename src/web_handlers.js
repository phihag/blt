'use strict';

const fs = require('fs');
const path = require('path');

const render = require('./render');

const ROOT_DIR = path.dirname(__dirname);

function root_handler(req, res, next) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	render(req, res, next, 'root', {
		events_json: JSON.stringify(events),
	});
}

function json_handler(req, res) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.send(JSON.stringify(events, null, 2));
}

function embed_handler(req, res, next) {
	const cfg = req.app.cfg;
	const events = req.app.state_handlers.map(sh => sh.ev);
	const embed_fn = path.join(
		ROOT_DIR,
		(cfg('production', false) ? 'dist/' : '') + 'static/embed.js'
	);
	fs.readFile(embed_fn, {encoding: 'utf8'}, (err, js) => {
		if (err) return next(err);

		js = js.replace('[]/*@INSERT_EVENTS_HERE*/', JSON.stringify(events));

		res.setHeader('Content-Type', 'application/javascript');
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.send(js);
	});
}

module.exports = {
	embed_handler,
	json_handler,
	root_handler,
};
