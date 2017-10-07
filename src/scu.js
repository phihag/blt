'use strict';

const assert = require('assert');
const xmldom = require('xmldom');


const calc = require('../static/calc');
const source_helper = require('./source_helper');
const utils = require('./utils');
const xmlutils = require('./xmlutils');


const MATCH_NAMES = {
	'Herrendoppel': 'HD1',
	'Herrendoppel 1': 'HD1',
	'Damendoppel': 'DD',
	'Herrendoppel 2': 'HD2',
	'Herreneinzel 1': 'HE1',
	'Herreneinzel 2': 'HE2',
	'Dameneinzel': 'DE',
	'Mixed': 'GD',
};

function _parse(html) {
	const matches = [];
	const scoring = '5x11_15^90';
	const res = {
		matches,
		scoring,
	};

	const header_m = /<div\s+class="spielstand">\s+<span\s+class="home">([^&<]+)(?:&nbsp;)*([0-9]+)(?:&nbsp;)*\s*:\s*(?:&nbsp;)*([0-9]+)(?:&nbsp;)*([^<&]+)<\/span>/.exec(html);
	if (header_m) {
		res.team_names = [header_m[1], header_m[4]];
		res.mscore = [parseInt(header_m[2]), parseInt(header_m[3])];
	}

	let match_m;
	const MATCH_PATTERN = /(<div class="spiel_1">[\s\S]*?<\/div>\s+<\/div>)/g;
	while ((match_m = MATCH_PATTERN.exec(html))) {
		const match_html = match_m[1];
		const parser = new xmldom.DOMParser();
		const doc = parser.parseFromString(match_html, 'text/html');

		const match_el = xmlutils.getElementsByClassName(doc, 'match')[0];
		assert(match_el);

		const scu_match_name = match_el.textContent;
		assert(scu_match_name);
		const match_name = MATCH_NAMES[scu_match_name] || scu_match_name;

		// This is called "game", for whatever reason
		const players_els = xmlutils.getElementsByClassName(doc, 'game');
		assert(players_els.length === 1);
		const players_el = players_els[0];
		const players_spans = xmlutils.find_els(
			players_el,
			(el) => (el.tagName === 'span') && !el.hasAttribute('class'));
		assert(players_spans.length === 2);
		const players = players_spans.map(
			pspan => xmlutils.child_texts(pspan).map(name => {
				return {
					name: name.trim(),
				};
			})
		);

		const score_els = xmlutils.getElementsByClassName(doc, 'punkte');
		assert.strictEqual(score_els.length, 5);
		let score = [];
		let game_idx = 0;
		for (const game_el of score_els) {
			const point_spans = xmlutils.find_els(
				game_el,
				(el) => (el.tagName === 'span') && (el.getAttribute('class') !== 'form'));
			const gscore = point_spans.map(span => parseInt(span.textContent));
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

		const match = {
			name: match_name,
			players,
			score,
		};
		matches.push(match);
	}
	return res;
}

function run_once(cfg, src, sh, cb) {
	const url = src.url;

	if (cfg('verbosity', 0) > 2) {
		console.log('[scu] Downloading ' + url); // eslint-disable-line no-console
	}

	utils.download_page(url, (err, _req, html) => {
		let event;
		try {
			event = _parse(html);
		} catch (e) {
			return cb(e);
		}

		if (!event.team_names) {
			console.error('[scu] Could not find team_names');
			event.team_names = src.team_names;
		}
		event.team_names[0] = src.team_names[0];

		event.link = src.url;
		source_helper.copy_props(event, src);
		sh.on_new_full(event);
		cb();
	});
}

function setup_tm(tm, home_team_cfg) {
	tm.link = home_team_cfg.link;
	tm.url = home_team_cfg.url;
}

module.exports = {
	run_once,
	setup_tm,

	// Testing only
	_parse,
};
