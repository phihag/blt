'use strict';

const fs = require('fs');
const path = require('path');

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
	render(req, res, next, 'allteams', {
		teams: team_data(req.app),
	}, true);

}

function streams_handler(req, res, next) {
	render(req, res, next, 'streams', {
		teams: team_data(req.app),
	}, true);
}

function stream_handler(req, res) {
	const shortname = req.params.shortname;
	res.redirect(`/bup/#display&dm_style=stream&bbt_poll=${shortname}&court=referee&nosettings`);
}

function streamcourt_handler(req, res) {
	const shortname = req.params.shortname;
	const court = req.params.court;
	res.redirect(`/bup/#display&dm_style=streamcourt&bbt_poll=${shortname}&court=${court}&nosettings`);
}

module.exports = {
	allteams_handler,
	embed_handler,
	json_handler,
	root_handler,
	streams_handler,
	stream_handler,
	streamcourt_handler,
};
