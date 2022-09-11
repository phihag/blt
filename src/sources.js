'use strict';

const assert = require('assert');
const async = require('async');
const path = require('path');

const eventutils = require('./eventutils');
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
		const matching_tms = tms.filter(search_tm => {
			return utils.deep_equal(o.team_names, search_tm.team_names);
		});

		let tm;
		if (matching_tms.length > 1) {
			tm = matching_tms.find(search_tm => o.date === search_tm.date);
		} else {
			tm = matching_tms[0];
		}

		if (!tm) {
			throw new Error(
				'Could not find match ' + o.team_names[0] + '-' + o.team_names[1] +
				' on ' + o.date + ' to override'
			);
		}

		assert(o.override, 'Could not find "override" property in match ' + o.team_names.join(' vs ') + ` on ${o.date}`);
		utils.obj_update(tm, o.override);
	}
}

function init(cfg, datestr, source_info, wss) {
	const {teammatches, overrides, sourcedb} = source_info;
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
		if (!tm.team_names) {
			throw new Error('Team match without team names: ' + JSON.stringify(tm));
		}
		tm.team_names = tm.team_names.map(eventutils.unify_team_name);
		const home_team_name = tm.team_names[0];
		const home_team = sourcedb[home_team_name];
		if (!home_team) {
			throw new Error('Cannot find home team ' + home_team_name + ' in sourcedb');
		}
		if (tm.type === 'auto') {
			tm.type = home_team.type;
			mod = TYPES[home_team.type];
		} else {
			mod = TYPES[tm.type];
		}
		if (!mod) {
			throw new Error('Unsupported source type ' + tm.type);
		}
		mod.setup_tm(tm, home_team);

		const sh = new StateHandler(wss, i);
		i++;
		if (mod.watch) {
			mod.watch(cfg, tm, sh);
		} else {
			const fast = cfg('fast_interval');
			const slow = cfg('slow_interval');
			utils.run_every((cb) => {
				if (sh.aborted) return;

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
	], (err, source_info_ar) => {
		if (err) return callback(err);

		callback(err, {
			teammatches: source_info_ar[0],
			overrides: source_info_ar[1],
			sourcedb: source_info_ar[2],
		});
	});
}

module.exports = {
	init,
	load,
};
