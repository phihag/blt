'use strict';

const assert = require('assert');

const calc = require('../static/calc');
const utils = require('./utils');

function calc_mscore(scoring, matches) {
	const res = [0, 0];
	for (const m of matches) {
		const mwinner = calc.match_winner(scoring, m.score);
		if (mwinner === 'left') {
			res[0]++;
		} else if (mwinner === 'right') {
			res[1]++;
		}
	}
	return res;
}

function unify_name(match_name) {
	const m = /^([0-9]+)\.\s*(.*)$/.exec(match_name);
	if (m) {
		return m[2] + m[1];
	}
	return match_name;
}

function unify_order(matches, league_key) {
	if (!matches) {
		return;
	}

	assert(Array.isArray(matches));

	const preferred = order_preferred_by_league(league_key);
	if (!preferred) {
		return;
	}

	matches.sort((m1, m2) => utils.cmp(preferred.indexOf(m1.name), preferred.indexOf(m2.name)));
}

const NRW2016_RE = /^NRW-(O19)-(?:(?:([NS])([12]))-)?([A-Z]{2})-([0-9]{3})-(?:2016|2017)$/;
function order_preferred_by_league(league_key) {
	if (NRW2016_RE.test(league_key) || (league_key === 'RLW-2016')) {
		// See §57.2 SpO
		return [
			'HD1',
			'HD2',
			'DD',
			'HE1',
			'HE2',
			'HE3',
			'DE',
			'GD',
		];
	}

	switch (league_key) {
	case '1BL-2016':
	case '2BLN-2016':
	case '2BLS-2016':
	case '1BL-2017':
	case '2BLN-2017':
	case '2BLS-2017':
	case '1BL-2018':
	case '2BLN-2018':
	case '2BLS-2018':
	case '1BL-2019':
	case '2BLN-2019':
	case '2BLS-2019':
	case '1BL-2020':
	case '2BLN-2020':
	case '2BLS-2020':
		// See BLO-DB §8.8
		return [
			'HD1',
			'DD',
			'HD2',
			'HE1',
			'DE',
			'GD',
			'HE2',
		];
	case 'RLN-2016':
		// Gruppenspielordnung Nord §7.9
		return [
			'HD1',
			'DD',
			'HD2',
			'HE1',
			'DE',
			'GD',
			'HE2',
			'HE3',
		];
	case 'RLM-2016':
		// SpO Gruppe Mitte §12c
		return [
			'HD1',
			'DD',
			'HD2',
			'HE1',
			'DE',
			'GD',
			'HE2',
			'HE3',
		];
	case 'OBL-2017':
		// Bundesligaordnung §6.1
		return [
			'HD1',
			'HD2',
			'DD',
			'HE1',
			'HE2',
			'DE',
			'HE3',
			'GD',
		];
	}
}

function league_scoring(league_key) {
	if (/^(?:1BL|2BLN|2BLS)-2015$/.test(league_key)) {
		return '3x21';
	}
	if (/^(?:1BL|2BLN|2BLS)-2016$/.test(league_key)) {
		return '5x11_15';
	}
	if (is_bundesliga(league_key)) {
		return '5x11_15^90';
	}
	if (NRW2016_RE.test(league_key) || /^RL[MNW]-2016$/.test(league_key)) {
		return '3x21';
	}
	if (league_key === 'OBL-2017') {
		return '3x21';
	}
	if (league_key === 'NLA-2017') {
		return '3x21';
	}
	if (league_key.startsWith('NRW')) {
		return '3x21';
	}
}

function unify_team_name(team_name) {
	team_name = team_name.replace('<wbr>', '');
	return {
		'STC BW Solingen': 'STC Blau-Weiss Solingen',
	}[team_name] || team_name;
}

function is_bundesliga(league_key) {
	return /^(?:1BL|2BLN|2BLS)-/.test(league_key);
}

function max_game_count(counting) {
	switch (counting) {
	case '5x11_15':
	case '5x11_15^90':
	case '5x11_15~NLA':
	case '5x11/3':
	case '5x11_11':
		return 5;
	case '3x21':
	case '3x15_18':
	case '2x21+11':
		return 3;
	case '1x21':
	case '1x11_15':
		return 1;
	default:
		throw new Error('Invalid counting scheme ' + counting);
	}
}

module.exports = {
	calc_mscore,
	is_bundesliga,
	max_game_count,
	league_scoring,
	unify_name,
	unify_order,
	unify_team_name,
};
