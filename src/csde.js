'use strict';

const assert = require('assert');

const eventutils = require('./eventutils');
const utils = require('./utils');
const source_helper = require('./source_helper');

const {TEAM_NAMES} = require('./csde_map.js');

const LEAGUE_KEY = {
	1: '1BL-2020',
	2: '2BLN-2020',
	3: '2BLS-2020',
	4: 'RLW-2016',
	5: 'RLN-2016',
	6: 'RLM-2016',
	7: 'RLSO-2019',
	8: 'OLSW-2020',
	9: 'NRW-O19-GW-OL-002-2016',
	10: 'NRW-O19-GW-OL-003-2016',
	11: '1BL-2020',
	12: '1BL-2020',
	13: '1BL-2020',
	14: '1BL-2020',
};


function parse(str) {
	if (str.includes('\'src="//sedoparking.com/frmpark/')) {
		return {
			error_msg: 'CourtSpot nicht erreichbar',
		};
	}

	const [err_msg, doc] = utils.parseXML(str);
	if (err_msg) {
		return {
			error_msg: 'Ungültiges XML in CourtSpot-Status',
		};
	}

	const status_el = doc.getElementsByTagName('STATUS')[0];
	if (!status_el) {
		return {
			error_msg: 'CourtSpot-Status fehlt',
		};
	}

	if (status_el.textContent != 'an') {
		return {};
	}

	const matches = [];
	const namen_containers = doc.getElementsByTagName('NAMEN');
	assert(namen_containers.length === 1);
	const namen_els = Array.from(namen_containers[0].getElementsByTagName('Name'));
	for (const el of namen_els) {
		const match_name = eventutils.unify_name(el.getElementsByTagName('Art')[0].textContent);
		const players = [[], []];

		for (let i = 0;;i++) {
			const home_p = el.getElementsByTagName('Heimspieler' + (i + 1))[0];
			const away_p = el.getElementsByTagName('Gastspieler' + (i + 1))[0];
			if (home_p && away_p) {
				const home_name = home_p.textContent;
				if (home_name) {
					players[0].push({name: home_name});
				}
				const away_name = away_p.textContent;
				if (away_name) {
					players[1].push({name: away_name});
				}
			} else {
				break;
			}
		}

		matches.push({
			name: match_name,
			players,
		});
	}

	const staende_containers = doc.getElementsByTagName('STAENDE');
	assert(staende_containers.length === 1);
	const staende_els = Array.from(staende_containers[0].getElementsByTagName('Stand'));
	for (const stand of staende_els) {
		const match_name = eventutils.unify_name(stand.getElementsByTagName('Art')[0].textContent);
		const score = [];
		for (let i = 0;;i++) {
			const home_pe = stand.getElementsByTagName('HS' + (i + 1))[0];
			const away_pe = stand.getElementsByTagName('GS' + (i + 1))[0];
			if (home_pe && away_pe) {
				const home_score = parseInt(home_pe.textContent);
				const away_score = parseInt(away_pe.textContent);
				if ((home_score < 0) || (away_score < 0)) {
					break;
				}
				score.push([home_score, away_score]);
			} else {
				break;
			}
		}

		const match = utils.find(matches, m => m.name === match_name);
		if (match) {
			match.score = score;
		} else {
			// We didn't see the match so far

		}
	}

	const courts = [];
	for (let court_id = 1;court_id <= 2;court_id++) {
		const cspec = doc.getElementsByTagName('Court' + court_id)[0].textContent;
		const match_name = eventutils.unify_name(cspec.substr(3));
		const court_spec = {
			label: '' + court_id,
		};
		if (!match_name) {
			courts.push(court_spec);
			continue;
		}

		const match = utils.find(matches, m => m.name === match_name);
		if (!match) {
			courts.push(court_spec);
			continue;
		}

		court_spec.match_id = match_name;
		courts.push(court_spec);

		const rspec = cspec.substr(0, 3);
		if (rspec === 'aus') {
			continue;
		}
		const server_char = rspec.substr(2);
		if ((server_char === 'a') || (server_char == 'b')) {
			match.serving = 0;
		} else if ((server_char === 'c') || (server_char == 'd')) {
			match.serving = 1;
		}
	}

	const ticker_state = {};

	const n_els = doc.getElementsByTagName('AKTNRNAME');
	if (n_els.length > 0) {
		ticker_state.n = n_els[0].textContent;
	}

	const s_els = doc.getElementsByTagName('AKTNRSTAND');
	if (s_els.length > 0) {
		ticker_state.s = s_els[0].textContent;
	}

	return {
		courts,
		matches,
		ticker_state,
	};
}

function integrate_update(new_ev, old_ev) {
	if (!old_ev) {
		return;
	}

}

function annotate(ev, params) {
	assert(params);
	assert(params.l !== undefined);
	assert(params.v !== undefined);
	assert(params.g !== undefined);

	ev.team_names = [TEAM_NAMES[params.l + '-' + params.v], TEAM_NAMES[params.l + '-' + params.g]];
	const league_key = LEAGUE_KEY[params.l];
	ev.scoring = eventutils.league_scoring(league_key);
	eventutils.unify_order(ev.matches, league_key);
	if (ev.matches) {
		ev.mscore = eventutils.calc_mscore(ev.scoring, ev.matches);
	} else {
		ev.mscore = [0, 0];
	}
}

function run_once(cfg, src, sh, cb) {
	let url = src.url;
	assert(url);

	const stateful_enabled = cfg('csde_stateful', false);
	if (stateful_enabled && sh.ticker_state.csde_n && sh.ticker_state.csde_s) {
		url += '&n=' + sh.ticker_state.csde_n + '&s=' + sh.ticker_state.csde_s;
	}

	if (cfg('verbosity', 0) > 2) {
		console.log('[csde] Downloading ' + url); // eslint-disable-line no-console
	}

	utils.download_page(url, (err, _req, txt) => {
		if (err) return cb(err);

		let event;
		try {
			const params = utils.parse_querystring(url);
			event = parse(txt);
			event.link = src.link + '&b';
			annotate(event, params);
		} catch (e) {
			return cb(e);
		}
		source_helper.copy_props(event, src);
		sh.on_new_full(event);
		cb();
	});
}

function setup_tm(tm, home_team) {
	tm.link = home_team.link;

	const team_ids = tm.team_names.map(tname => {
		let league_code;
		for (const k in TEAM_NAMES) {
			league_code = tm.csde_league_code;
			if (league_code && !k.startsWith(league_code)) {
				continue;
			}
			if (TEAM_NAMES[k] === tname) {
				return k;
			}
		}

		const league_text = league_code ? `(league code ${league_code}) ` : '';
		throw new Error(`Team ${tname}${league_text} missing in csde database`);
	});

	let cs_league_code;
	const [l0, v] = team_ids[0].split('-');
	const [l1, g] = team_ids[1].split('-');
	if (tm.csde_league_code) {
		cs_league_code = tm.csde_league_code;
	} else {
		assert(l0 === l1,
			'Liga-IDs der Mannschaften unterscheiden sich: ' +
			tm.team_names[0] + ': ' + l0 + ', ' +
			tm.team_names[1] + ': ' + l1);
		cs_league_code = l0;
	}
	assert(cs_league_code);

	tm.url = 'https://courtspot.de/php__Skripte/liveabfrage.php?l=' + cs_league_code + '&v=' + v + '&g=' + g;
	tm.link = 'https://courtspot.de/live/?Liga=' + cs_league_code;
}

module.exports = {
	run_once,
	setup_tm,
	integrate_update,

	// Testing only
	_parse: parse,
	_annotate: annotate,
	_TEAM_NAMES: TEAM_NAMES,
};
