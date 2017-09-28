'use strict';

const render = require('./render');

function root_handler(req, res, next) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	render(req, res, next, 'root', {
		events_json: JSON.stringify(events),
	});
}

function json_handler(req, res, next) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.send(JSON.stringify(events, null, 2));
}

module.exports = {
	root_handler,
	json_handler,
};
