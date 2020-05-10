'use strict';

const cutils = require('../static/cutils');
const extradata = require('../static/extradata');
const utils = require('./utils');


function team_data(app) {
	const tms = app.source_info.teammatches;
	const team_map = new Map();
	const _add_team = (team_name, league_key) => {
		if (team_map.has(team_name)) return;

		const short_name = extradata.shortname(team_name);
		const color = extradata.get_color(team_name);

		team_map.set(team_name, {
			color,
			color_css: cutils.color_css(color),
			team_name,
			league_key,
			short_name,
			short_name_lower: short_name.toLowerCase(),
			link: 'https://b.aufschlagwechsel.de/#' + short_name,
			logo: extradata.team_logo(team_name),
		});
	};

	// Usually, the order does not matter because every team only plays once a day.
	// However, for testing or in special situations, we want the home matches first.
	for (const tm of tms) {
		_add_team(tm.team_names[0], tm.league_key);
	}
	for (const tm of tms) {
		_add_team(tm.team_names[1], tm.league_key);
	}

	return Array.from(team_map.values()).sort(utils.cmp_key('short_name'));

}

module.exports = {
	team_data,
};
