'use strict';

const assert = require('assert');

const eventutils = require('./eventutils');
const utils = require('./utils');
const source_helper = require('./source_helper');


const MATCH_NAMES = {
	'1': 'HD1',
	'2': 'DD',
	'3': 'HD2',
	'4': 'HE1',
	'5': 'DE',
	'6': 'GD',
	'7': 'HE2',
};

function _parse_players(player_str) {
	if (player_str === '') {
		return [];
	}

	const doubles_m = /<span>([^<]+)<\/span>, ([^<]+)<br><span>([^<]+)<\/span>, ([^<]+)/.exec(player_str);
	if (doubles_m) {
		return [{
			name: doubles_m[2] + ' ' + doubles_m[1],
		}, {
			name: doubles_m[4] + ' ' + doubles_m[3],
		}];
	}

	const singles_m = /<p><span>([^<]+)<\/span>, ([^<]+)<\/p>/.exec(player_str);
	if (singles_m) {
		return [{
			name: singles_m[2] + ' ' + singles_m[1],
		}];
	}

	throw new Error('Unparsable: ' + JSON.stringify(player_str));
}

function parse(str) {
	const pipe_parts = str.split('|');
	const metadata_ar = pipe_parts[0].split('~');

	const mscore = [parseInt(metadata_ar[1]), parseInt(metadata_ar[2])];
	const team_names = [metadata_ar[3], metadata_ar[4]].map(eventutils.unify_team_name);

	const match_parts = pipe_parts.slice(1, -1);
	const matches = match_parts.map(mp_str => {
		const mp = mp_str.split('~');
		const res = {
			name: MATCH_NAMES[mp[0]],
			score: [],
		};

		const players = [
			_parse_players(mp[4]),
			_parse_players(mp[5]),
		];
		if ((players[0].length > 0) || (players[1].length > 0)) {
			res.players = players;
		}

		for (let game_idx = 0;game_idx < 5;game_idx++) {
			if (mp[6 + game_idx] !== '') {
				res.score.push([
					parseInt(mp[6 + game_idx]),
					parseInt(mp[6 + game_idx + 5]),
				]);
			}
		}

		if (mp[2] === 'H') {
			res.serving = 0;
		} else if (mp[2] === 'G') {
			res.serving = 1;
		}

		return res;
	});
	const scoring = '5x11_15^90';

	return {
		team_names,
		mscore,
		matches,
		scoring,
	};
}

function run_once(cfg, src, sh, cb) {
	const base_url = src.url;

	assert(base_url.endsWith('/'));
	const url = base_url + 'ticker.php';

	if (cfg('verbosity', 0) > 2) {
		console.log('[btde] Downloading ' + url); // eslint-disable-line no-console
	}

	utils.download_page(url, (err, _req, txt) => {
		if (err) return cb(err);

		let event;
		try {
			event = parse(txt);
		} catch (e) {
			return cb(e);
		}
		event.link = base_url;
		source_helper.copy_props(event, src);
		sh.on_new_full(event);
		return cb();
	});
}

function setup_tm(tm, home_team) {
	tm.url = home_team.url;
}

module.exports = {
	run_once,
	setup_tm,

	// Testing only
	_parse: parse,
};
