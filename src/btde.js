'use strict';

const assert = require('assert');

const eventutils = require('./eventutils');
const utils = require('./utils');
const source_helper = require('./source_helper');
const {is_bundesliga, max_game_count, league_scoring} = require('./eventutils');

const MATCH_NAMES_BUNDESLIGA = {
	'1': 'HD1',
	'2': 'DD',
	'3': 'HD2',
	'4': 'HE1',
	'5': 'DE',
	'6': 'GD',
	'7': 'HE2',
};
const MATCH_NAMES_8 = {
	'1': 'HD1',
	'2': 'HD2',
	'3': 'DD',
	'4': 'HE1',
	'5': 'HE2',
	'6': 'HE3',
	'7': 'DD',
	'8': 'GD',
};


function _parse_players(player_str) {
	if (player_str === '') {
		return [];
	}

	const doubles_m = /([^,/]+), ([^,/]+)\/([^,/]+), ([^,/]+)/.exec(player_str);
	if (doubles_m) {
		return [{
			name: doubles_m[2] + ' ' + doubles_m[1],
		}, {
			name: doubles_m[4] + ' ' + doubles_m[3],
		}];
	}

	const singles_m = /([^,/]+),\s*([^,/]+)/.exec(player_str);
	if (singles_m) {
		return [{
			name: singles_m[2] + ' ' + singles_m[1],
		}];
	}

	const doubles_simple_m = /([^/]+)\/([^/]+)/.exec(player_str);
	if (doubles_simple_m) {
		return [
			{name: doubles_simple_m[1].trim()},
			{name: doubles_simple_m[2].trim()},
		];
	}

	// Hopefully just a simple singles player
	if (!player_str.includes(',') && !player_str.includes('/')) {
		return [{name: player_str}];
	}

	throw new Error('Unparsable: ' + JSON.stringify(player_str));
}

function parse(src, str) {
	const pipe_parts = str.split('|');
	const metadata_ar = pipe_parts[0].split('~');

	const mscore = [parseInt(metadata_ar[1]), parseInt(metadata_ar[2])];
	const team_names = [metadata_ar[3], metadata_ar[4]].map(eventutils.unify_team_name);

	const scoring = league_scoring(src.league_key) || '5x11_15^90';
	const MATCH_NAMES = is_bundesliga(src.league_key) ? MATCH_NAMES_BUNDESLIGA : MATCH_NAMES_8;
	const GAME_COUNT = max_game_count(scoring);

	const match_parts = pipe_parts.slice(1, -1);
	const courts = [{label: '1'}, {label: '2'}];
	const matches = match_parts.map(mp_str => {
		const mp = mp_str.split('~');
		const res = {
			name: MATCH_NAMES[mp[0]],
			score: [],
		};
		const court_id = mp[1];
		if (court_id === '1') {
			courts[0].match_id = res.name;
		} else if (court_id === '2') {
			courts[1].match_id = res.name;
		}

		const players = [
			_parse_players(mp[5]),
			_parse_players(mp[6]),
		];
		if ((players[0].length > 0) || (players[1].length > 0)) {
			res.players = players;
		}

		const SCORE_IDXSTART = 7;
		for (let game_idx = 0;game_idx < GAME_COUNT;game_idx++) {
			if (mp[SCORE_IDXSTART + game_idx] !== '') {
				res.score.push([
					parseInt(mp[SCORE_IDXSTART + game_idx]),
					parseInt(mp[SCORE_IDXSTART + game_idx + GAME_COUNT]),
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

	return {
		team_names,
		mscore,
		matches,
		scoring,
		courts,
	};
}

function run_once(cfg, src, sh, cb) {
	const base_url = src.url || src.btde_url;
	assert(base_url);
	assert(base_url.endsWith('/'));
	const url = base_url + 'ticker.php';

	if (cfg('verbosity', 0) > 2) {
		console.log('[btde] Downloading ' + url); // eslint-disable-line no-console
	}

	utils.download_page(url, (err, _req, txt) => {
		if (err) return cb(err);

		let event;
		try {
			event = parse(src, txt);
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
