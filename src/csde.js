'use strict';

const assert = require('assert');

const eventutils = require('./eventutils');
const utils = require('./utils');
const source_helper = require('./source_helper');

const TEAM_NAMES = {
	'1-1': '1.BC Sbr.-Bischmisheim',
	'1-2': 'SC Union Lüdinghausen',
	'1-3': 'TV Refrath',
	'1-4': '1.BV Mülheim',
	'1-5': '1.BC Beuel',
	'1-6': '1.BC Wipperfeld',
	'1-7': 'TSV Trittau',
	'1-8': 'TSV Neuhausen-Nymphenburg',
	'1-9': 'TSV 1906 Freystadt',
	'1-10': 'SV Fun-Ball Dortelweil',
	'2-11': 'Blau-Weiss Wittorf-NMS',
	'2-12': 'TV Refrath 2',
	'2-13': 'SG EBT Berlin',
	'2-14': 'STC Blau-Weiss Solingen',
	'2-15': 'TSV Trittau 2',
	'2-16': '1.BV Mülheim 2',
	'2-17': '1.BC Beuel 2',
	'2-18': 'BC Hohenlimburg',
	'2-19': 'Hamburg Horner TV',
	'2-20': 'VfB/SC Peine',
	'3-21': 'TuS Wiebelskirchen',
	'3-22': '1.BC Sbr.-Bischmisheim 2',
	'3-23': 'TSV Neubiberg/Ottobrunn 1920',
	'3-24': 'TV Dillingen',
	'3-25': 'VfB Friedrichshafen',
	'3-26': 'SG Schorndorf',
	'3-27': 'BSpfr. Neusatz',
	'3-28': 'TV 1884 Marktheidenfeld',
	'3-29': 'SV GutsMuths Jena',
	'3-30': 'SV Fischbach',
	'4-1': 'SG EBT Berlin 2',
	'4-2': 'BV Gifhorn 1',
	'4-3': 'SG Luckau/Blankenfelde 1',
	'4-4': 'SG Vechelde/Lengede 1',
	'4-5': 'BW Wittorf Neumünster 2',
	'4-6': 'BC Eintracht Südring Berlin 1',
	'4-7': 'SG FTV/HSV/VfL 93 Hamburg 1',
	'4-8': 'SV Berliner Brauereien 1',
	'5-1': 'STC BW Solingen 2',
	'5-1477': 'BC Phönix Hövelhof 1',
	'5-211': 'BV RW Wesel 1',
	'5-505': 'Gladbecker FC 1',
	'5-682': 'Bottroper BG 1',
	'5-715': 'Spvgg.Sterkrade-N. 1',
	'5-810': 'BC Hohenlimburg 2',
	'5-89': '1.CfB Köln 1',
};
const LEAGUE_KEY = {
	1: '1BL-2017',
	2: '2BLN-2017',
	3: '2BLS-2017',
	4: 'RLN-2016',
	5: 'RLW-2016',
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

	for (let court_id = 1;court_id <= 2;court_id++) {
		const cspec = doc.getElementsByTagName('Court' + court_id)[0].textContent;
		const match_name = eventutils.unify_name(cspec.substr(3));
		if (!match_name) {
			continue;
		}

		const match = utils.find(matches, m => m.name === match_name);
		if (!match) {
			continue;
		}

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

	const stateful_enabled = cfg('csde_stateful', false);
	if (stateful_enabled && sh.ticker_state.csde_n && sh.ticker_state.csde_s) {
		url += '&n=' + sh.ticker_state.csde_n + '&s=' + sh.ticker_state.csde_s;
	}

	if (cfg('verbosity', 0) > 2) {
		console.log('[csde] Downloading ' + url); // eslint-disable-line no-console
	}

	utils.download_page(url, (err, _req, txt) => {
		let event;
		try {
			const params = utils.parse_querystring(url);
			event = parse(txt);
			event.link = src.link;
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
		for (const k in TEAM_NAMES) {
			if (TEAM_NAMES[k] === tname) {
				return k;
			}
		}

		throw new Error('Team ' + tname + ' missing in csde database');
	});

	const [l0, v] = team_ids[0].split('-');
	const [l1, g] = team_ids[1].split('-');
	assert(l0 === l1);

	tm.url = 'http://courtspot.de/php__Skripte/liveabfrage.php?l=' + l0 + '&v=' + v + '&g=' + g;
	tm.link = 'https://www.courtspot.de/live/?Liga=' + l0;
}

module.exports = {
	run_once,
	setup_tm,
	integrate_update,

	// Testing only
	_parse: parse,
	_annotate: annotate,
};
