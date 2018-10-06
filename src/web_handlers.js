'use strict';

const fs = require('fs');
const path = require('path');

const extradata = require('../static/extradata');
const render = require('./render');
const utils = require('./utils');

const ROOT_DIR = path.dirname(__dirname);

function root_handler(req, res, next) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	render(req, res, next, 'root', {
		events_json: JSON.stringify(events),
	});
}

function json_handler(req, res) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	res.setHeader('Content-Type', 'application/json');
	res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
	res.send(JSON.stringify(events, null, 2));
}

function embed_handler(req, res, next) {
	const cfg = req.app.cfg;
	const events = req.app.state_handlers.map(sh => sh.ev);
	const embed_fn = path.join(
		ROOT_DIR,
		(cfg('production', false) ? 'dist/' : '') + 'static/embed.js'
	);
	fs.readFile(embed_fn, {encoding: 'utf8'}, (err, js) => {
		if (err) return next(err);

		js = js.replace('[]/*@INSERT_EVENTS_HERE*/', JSON.stringify(events));

		res.setHeader('Content-Type', 'application/javascript');
		res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
		res.send(js);
	});
}

function allteams_handler(req, res, next) {
	const tms = req.app.source_info.teammatches;
	const team_map = new Map();
	const _add_team = (team_name, league_key) => {
		if (team_map.has(team_name)) return;

		const short_name = extradata.shortname(team_name);

		team_map.set(team_name, {
			team_name,
			league_key,
			short_name,
			link: 'https://b.aufschlagwechsel.de/#' + short_name,
			logo: extradata.team_logo(team_name),
		});
	};

	for (const tm of tms) {
		_add_team(tm.team_names[0], tm.league_key);
		_add_team(tm.team_names[1], tm.league_key);
	}

	const teams = Array.from(team_map.values()).sort(utils.cmp_key('team_name'));

	render(req, res, next, 'allteams', {
		teams,
	}, true);

}

module.exports = {
	allteams_handler,
	embed_handler,
	json_handler,
	root_handler,
};
