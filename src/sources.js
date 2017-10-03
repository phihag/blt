'use strict';

const async = require('async');
const path = require('path');

const utils = require('./utils');
const StateHandler = require('./state_handler').StateHandler;

const TYPES = {
	btde: require('./btde'),
	csde: require('./csde'),
	none: require('./none_source'),
	sclive: require('./sclive'),
	scu: require('./scu'),
};

function init(cfg, datestr, source_info, wss) {
	const [teammatches, sourcedb] = source_info;

	const shs = [];
	let i = 0;
	for (const tm of teammatches) {
		if (tm.disabled) {
			continue;
		}

		if (tm.date !== datestr) {
			continue;
		}

		let mod;
		if (tm.type === 'auto') {
			const home_team_name = tm.team_names[0];
			const home_team = sourcedb[home_team_name];
			if (!home_team) {
				throw new Error('Cannot find home team ' + home_team_name + ' in sourcedb');
			}

			tm.type = home_team.type;
			mod = TYPES[home_team.type];
			if (!mod) {
				throw new Error('Unsupported source type ' + tm.type);
			}
			mod.setup_tm(tm, home_team);
		} else {
			mod = TYPES[tm.type];
			if (!mod) {
				throw new Error('Unsupported source type ' + tm.type);
			}
		}

		const sh = new StateHandler(wss, i);
		i++;
		mod.watch(cfg, tm, sh);
		shs.push(sh);
	}
	return shs;
}

function load(callback) {
	async.parallel([
		cb => utils.read_json(path.join(path.dirname(__dirname), 'teammatches.json'), cb),
		cb => utils.read_json(path.join(path.dirname(__dirname), 'sourcedb.json'), cb),
	], (err, source_info) => {
		if (err) return callback(err);

		callback(err, source_info);
	});
}

module.exports = {
	init,
	load,
};
