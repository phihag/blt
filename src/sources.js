'use strict';

const assert = require('assert');
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

function apply_overrides(tms, overrides) {
	for (const o of overrides) {
		const tm = utils.find(tms, (search_tm) => {
			return (
				utils.deep_equal(o.team_names, search_tm.team_names) &&
				(o.datestr === search_tm.datestr)
			);
		});
		if (!tm) {
			throw new Error(
				'Could not find match ' + o.team_names[0] + '-' + o.team_names[1] +
				' on ' + o.datestr + ' to override'
			);
		}

		assert(o.override);
		utils.obj_update(tm, o.override);
	}
}

function init(cfg, datestr, source_info, wss) {
	const [teammatches, overrides, sourcedb] = source_info;
	apply_overrides(teammatches, overrides);

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
		if (mod.watch) {
			mod.watch(cfg, tm, sh);
		} else {
			const fast = cfg('fast_interval');
			const slow = cfg('slow_interval')
			utils.run_every((cb) => {
				mod.run_once(cfg, tm, sh, (err) => {
					const next = (!tm.ts || (Date.now() >= tm.ts * 1000 - 10 * slow)) ? fast : slow;
					cb(err, next);
				});
			});
		}
		shs.push(sh);
	}
	return shs;
}

function load(callback) {
	async.parallel([
		cb => utils.read_json(path.join(path.dirname(__dirname), 'teammatches.json'), cb),
		cb => utils.read_json(path.join(path.dirname(__dirname), 'tm_overrides.json'), cb),
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
