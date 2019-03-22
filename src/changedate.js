'use strict';

const assert = require('assert');

const sources = require('./sources');
const utils = require('./utils');

function setup(app, wss, source_info) {
	let datestr = app.cfg('datestr', 'auto');

	if (datestr === 'auto') {
		const now = new Date();
		const now_str = now.getFullYear() + '-' + utils.pad(now.getMonth() + 1) + '-' + utils.pad(now.getDate());
		datestr = next_date(source_info.teammatches, now_str);
	}

	init(app, datestr, source_info, wss);

	// TODO advance to next date
}

function next_date(teammatches, now_str) {
	assert(teammatches);
	assert(teammatches.length > 0);
	let res = teammatches[teammatches.length - 1].date;

	for (const tm of teammatches) {
		if (!/^([0-9]{4,})-([0-9]{2})-([0-9]{2})$/.test(tm.date)) {
			console.log(`Cannot parse date ${JSON.stringify(tm.date)}`); // eslint-disable-line no-console
			continue;
		}

		if (tm.date < now_str) {
			continue;
		}

		if (tm.date < res) {
			res = tm.date;
		}
	}

	return res;
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
	// Test only
	next_date,
};
