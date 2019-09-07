'use strict';
// Shuttlecock-live (github.com/meyerjo/ticker)

const calc = require('../static/calc');
const eventutils = require('./eventutils');
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

// Downloaded from
// 1BL:  https://www.shuttlecock-live.com/l/Bundesliga/json
// 2BLN: https://www.shuttlecock-live.com/l/2.%20Bundesliga/json
const MATCH_IDS = [
	{'id': 77, 'team_a': '1. BC Beuel', 'team_b': 'TV Refrath', 'match_time': 1576868400.0},
	{'id': 78, 'team_a': '1. BC Beuel', 'team_b': 'Union L\u00fcdinghausen', 'match_time': 1577023200.0},
	{'id': 79, 'team_a': '1. BC Beuel', 'team_b': '1. BV Muelheim', 'match_time': 1580047200.0},
	{'id': 80, 'team_a': '1. BC Beuel', 'team_b': 'TSV Trittau', 'match_time': 1584284400.0},
	{'id': 89, 'team_a': '1. BC Beuel', 'team_b': 'Blau-Weiss Wittorf-NMS 1', 'match_time': 1568484000.0},
	{'id': 90, 'team_a': '1. BC Beuel', 'team_b': 'TSV Freystadt', 'match_time': 1570298400.0},
	{'id': 91, 'team_a': '1. BC Beuel', 'team_b': 'TSV Neuhausen-Nymphenburg', 'match_time': 1570370400.0},
	{'id': 92, 'team_a': '1. BC Beuel', 'team_b': '1. BC Bischmisheim', 'match_time': 1572184800.0},
	{'id': 93, 'team_a': '1. BC Beuel', 'team_b': '1. BC Wipperfeld 1', 'match_time': 1584126000.0},

	{'id': 81, 'team_a': '1. BC Beuel 2', 'team_b': '1.BV M\u00fclheim 2', 'match_time': 1567951200.0},
	{'id': 82, 'team_a': '1. BC Beuel 2', 'team_b': 'STC Blau-Weiss Solingen', 'match_time': 1571508000.0},
	{'id': 83, 'team_a': '1. BC Beuel 2', 'team_b': 'Hamburg Horner TV', 'match_time': 1572112800.0},
	{'id': 84, 'team_a': '1. BC Beuel 2', 'team_b': 'TV Refrath 2', 'match_time': 1573304400.0},
	{'id': 85, 'team_a': '1. BC Beuel 2', 'team_b': 'TSV Trittau 2', 'match_time': 1576951200.0},
	{'id': 86, 'team_a': '1. BC Beuel 2', 'team_b': 'SG EBT Berlin', 'match_time': 1581256800.0},
	{'id': 87, 'team_a': '1. BC Beuel 2', 'team_b': 'BC Hohenlimburg', 'match_time': 1582394400.0},
	{'id': 88, 'team_a': '1. BC Beuel 2', 'team_b': 'BV RW Wesel', 'match_time': 1584270000.0},
	{'id': 96, 'team_a': '1. BC Beuel 2', 'team_b': 'SV Berliner Brauereien 1', 'match_time': 1581184800.0}
];

const ALIAS_NAMES = {
	'1. BC Bischmisheim': '1. BC Sbr.-Bischmisheim',
	'1. BC Beuel 2': '1.BC Beuel 2',
	'1. BC Beuel': '1.BC Beuel',
	'1. BV Mülheim': '1.BV Mülheim',
	'1. BV Muelheim': '1.BV Mülheim',
	'1. BV Mülheim 2': '1.BV Mülheim 2',
	'1. BV Muelheim 2': '1.BV Mülheim 2',
	'1. BC Wipperfeld 1': '1.BC Wipperfeld',
	'SV Fun-Ball Dortelweil 1': 'SV Fun-Ball Dortelweil',
	'Blau-Weiss Wittorf-NMS 1': 'Blau-Weiss Wittorf-NMS',
	'TSV Freystadt': 'TSV 1906 Freystadt',
	'VfB/SC Peine': 'SG VfB/SC Peine',
	'Spvgg Sterkrade-Nord 1': 'Spvgg.Sterkrade-N.',
};
function _team_name(name_str) {
	return ALIAS_NAMES[name_str] || name_str;
}

function _parse(data_json) {
	const data = JSON.parse(data_json);

	const matches = [];
	const league_key = '1BL-2017';
	const scoring = eventutils.league_scoring(league_key);
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

	eventutils.unify_order(matches, league_key);

	return res;
}

function run_once(cfg, src, sh, cb) {
	const match_info = utils.find(MATCH_IDS, (mi => {
		return (
			(_team_name(mi.team_a) === _team_name(src.team_names[0])) &&
			(_team_name(mi.team_b) === _team_name(src.team_names[1])));
	}));

	if (!match_info) {
		const admin_note = (
			src.admin_note ||
			('Konfigurations-Fehler: URL des Tickers für ' +
				_team_name(src.team_names[0]) + ' - ' +
				_team_name(src.team_names[1]) + ' fehlt'
			)
		);
		const event = {
			admin_note,
			matches: [],
		};
		source_helper.copy_props(event, src);
		sh.on_new_full(event);
		return;
	}
	const base_url = 'https://www.shuttlecock-live.com/ticker/match/' + match_info.id;

	const url = base_url + '/json';

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

		event.link = base_url;
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
