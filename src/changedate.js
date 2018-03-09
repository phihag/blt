'use strict';

const sources = require('./sources');
const utils = require('./utils');

function setup(app, wss, source_info) {
	const now = new Date();
	const default_datestr = now.getFullYear() + '-' + utils.pad(now.getMonth() + 1) + '-' + utils.pad(now.getDate());
	const datestr = app.cfg('datestr', default_datestr);
	init(app, datestr, source_info, wss);

	// TODO advance to next date
}

function init(app, datestr, source_info, wss) {
	app.state_handlers = sources.init(app.cfg, datestr, source_info, wss);
	utils.broadcast(wss, JSON.stringify({
		type: 'init',
		events: app.state_handlers.map(sh => sh.ev),
	}));
}

module.exports = {
	setup,
};
