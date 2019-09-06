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

	throw new Error('Unparsable: ' + JSON.stringify(player_str));
}

function parse(str) {
	const match_strings = str.split('|').slice(0, -1);
	const matches = match_strings.map(m_str => {
		const mp = m_str.split('~');

		const res = {
			name: MATCH_NAMES[mp[0]],
			score: [],
		};

		const players = [
			_parse_players(mp[5]),
			_parse_players(mp[6]),
		];
		if ((players[0].length > 0) || (players[1].length > 0)) {
			res.players = players;
		}

		const SCORE_IDXSTART = 7;
		for (let game_idx = 0;game_idx < 5;game_idx++) {
			if (mp[SCORE_IDXSTART + game_idx] !== '') {
				res.score.push([
					parseInt(mp[SCORE_IDXSTART + game_idx]),
					parseInt(mp[SCORE_IDXSTART + game_idx + 5]),
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
		matches,
		scoring,
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
