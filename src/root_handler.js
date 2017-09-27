'use strict';

const render = require('./render');

function root_handler(req, res, next) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	render(req, res, next, 'root', {
		events_json: JSON.stringify(events),
	});
}

module.exports = root_handler;
