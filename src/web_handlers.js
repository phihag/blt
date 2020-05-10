'use strict';

const fs = require('fs');
const path = require('path');

const extradata = require('../static/extradata');
const render = require('./render');
const {team_data} = require('./data');

const ROOT_DIR = path.dirname(__dirname);

function root_handler(req, res, next) {
	const events = req.app.state_handlers.map(sh => sh.ev);

	render(req, res, next, 'root', {
		events_json: JSON.stringify(events),
	});
}

function json_handler(req, res) {
	let events = req.app.state_handlers.map(sh => sh.ev);

	let team = req.query.team;
	if (team) {
		team = team.toLowerCase();
		events = events.filter(ev => {
			if (!ev.team_names) return;
			const _name = team_name => extradata.shortname(team_name.toLowerCase());
			return (
				_name(ev.team_names[0]) === team ||
				_name(ev.team_names[1]) === team
			);
		});
	}

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
	render(req, res, next, 'allteams', {
		teams: team_data(req.app),
	}, true);

}

function streams_handler(req, res, next) {
	render(req, res, next, 'streams', {
		teams: team_data(req.app),
	}, true);
}

module.exports = {
	allteams_handler,
	embed_handler,
	json_handler,
	root_handler,
	streams_handler,
};
