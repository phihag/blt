'use strict';
// Shuttlecock-live (github.com/meyerjo/ticker)

const calc = require('../static/calc');
const source_helper = require('./source_helper');
const utils = require('./utils');


const MATCH_NAMES = {
	'1. Herrendoppel': 'HD1',
	'2. Herrendoppel': 'HD2',
	'Damendoppel': 'DD',
	'1. Herreneinzel': 'HE1',
	'2. Herreneinzel': 'HE2',
	'Dameneinzel': 'DE',
	'Gemischtes Doppel': 'GD',
	'Mixed': 'GD',
};

const ALIAS_NAMES = {
	'1. BC Beuel': '1.BC Beuel',
	'1. BC Beuel 2': '1.BC Beuel 2',
	'TSV Freystadt': 'TSV 1906 Freystadt',
};
function _team_name(name_str) {
	return ALIAS_NAMES[name_str] || name_str;
}

function _parse(data_json) {
	const data = JSON.parse(data_json);

	const matches = [];
	const scoring = '5x11_15^90';
	const res = {
		matches,
		scoring,
		mscore: data.result,
		team_names: [
			_team_name(data.team_a),
			_team_name(data.team_b),
		],
	};

	for (const match_data of data.games) {
		const name = (MATCH_NAMES[match_data.name] || match_data.name);

		const players = [match_data.player_a, match_data.player_b].map(
			phtml => phtml.split(/\s*<br\/?>\s*/).filter(name => name).map(name => {
				return {name};
			})
		);
		let score = [];
		let game_idx = 0;
		for (const game_data of match_data.sets) {
			const gscore = game_data[2];
			score.push(gscore);

			if (calc.match_winner(scoring, score) !== 'inprogress') {
				break;
			}
			if (calc.game_winner(scoring, game_idx, gscore[0], gscore[1]) === 'inprogress') {
				break;
			}
			game_idx++;
		}
		if (utils.deep_equal(score, [[0, 0]])) {
			score = [];
		}

		matches.push({
			score,
			players,
			name,
		});
	}

	return res;
}

function run_once(cfg, src, sh, cb) {
	const url = src.url + '/json';

	if (cfg('verbosity', 0) > 2) {
		console.log('[sclive] Downloading ' + url); // eslint-disable-line no-console
	}

	utils.download_page(url, (err, _req, data_json) => {
		let event;
		try {
			event = _parse(data_json);
		} catch (e) {
			return cb(e);
		}

		event.link = src.url;
		source_helper.copy_props(event, src);
		sh.on_new_full(event);
		cb();
	});
}

function setup_tm(/*tm, home_team_cfg*/) {
	// Nothin needed, everything already in tm
}

module.exports = {
	run_once,
	setup_tm,

	// Testing only
	_parse,
};
