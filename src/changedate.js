'use strict';

const assert = require('assert');

const cron = require('node-cron');
const sources = require('./sources');
const utils = require('./utils');

function get_now_str() {
	const now = new Date();
	return now.getFullYear() + '-' + utils.pad(now.getMonth() + 1) + '-' + utils.pad(now.getDate());
}

function setup(app, wss, source_info) {
	let datestr = app.cfg('datestr', 'auto');

	const is_auto = datestr === 'auto';
	if (is_auto) {
		datestr = next_date(source_info.teammatches, get_now_str());
	}

	init(app, datestr, source_info, wss);

	if (is_auto) {
		cron.schedule('1 0 * * *', () => {
			const new_date = next_date(source_info.teammatches, get_now_str());
			if (app.cfg('verbosity', 0) >= 3) {
				console.log(`Checking date at ${(new Date()).toISOString()} (currently displayed: ${new_date})`);
			}
			if (new_date !== datestr) {
				if (app.cfg('verbosity', 0) >= 2) {
					console.log(`Switching from ${datestr} to ${new_date}`);
				}
				datestr = new_date;
				init(app, datestr, source_info, wss);
			}
		});
	}
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
	for (const sh of (app.state_handlers || [])) {
		sh.aborted = true;
	}

	app.state_handlers = sources.init(app.cfg, datestr, source_info, wss);
	utils.broadcast(wss, {
		type: 'init',
		events: app.state_handlers.map(sh => sh.ev),
	});
}

module.exports = {
	setup,
	// Test only
	next_date,
};
