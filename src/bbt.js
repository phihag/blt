const async = require('async');
const express = require('express');
const http = require('http');
const url = require('url');

const ws_module = require('ws');

const config = require('./config');
const sources = require('./sources');
const routes = require('./routes');
const utils = require('./utils');


function setup_ws(app, ws, req) {
	const location = url.parse(req.url, true);

	if (! location.path.endsWith('/subscribe')) {
		utils.send(ws, {
			type: 'error',
			message: 'Invalid location path ' + location.path,
		});
		ws.close();
		return;
	}
	ws.onmessage = (e) => {
		let msg;
		try {
			msg = JSON.parse(e.data);
		} catch (e) {
			console.error('Client did not send us valid JSON, terminating: ' + e.stack); // eslint-disable-line no-console
			ws.close();
			return;
		}

		if (msg.type === 'keepalive') {
			try {
				ws.send(JSON.stringify({
					type: 'keptalive',
				}));
			} catch (_) {
				// Ignore
			}
		}
	};

	const events = app.state_handlers.map(sh => sh.ev);
	ws.send(JSON.stringify({
		type: 'init',
		events: events,
	}));
}


function run_server(cfg, source_info) {
	const server = http.createServer();
	const wss = new ws_module.Server({server});
	const app = express();

	app.cfg = cfg;
	app.root_path = cfg('root_path');

	// Set up state handlers
	const now = new Date();
	const default_datestr = now.getFullYear() + '-' + utils.pad(now.getMonth() + 1) + '-' + utils.pad(now.getDate());
	const datestr = cfg('datestr', default_datestr);
	app.state_handlers = sources.init(cfg, datestr, source_info, wss);
	utils.broadcast(wss, JSON.stringify({
		type: 'init',
		events: app.state_handlers.map(sh => sh.ev),
	}));

	wss.on('connection', (ws, req) => setup_ws(app, ws, req));

	routes.setup(cfg, app);

	server.on('request', app);
	server.listen(cfg('port'), () => {});
}

function main() {
	async.waterfall([
		config.load,
		(cfg, cb) => sources.load((err, source_info) => cb(err, cfg, source_info)),
	], (err, cfg, source_info) => {
		if (err) {
			throw err;
		}
		run_server(cfg, source_info);
	});
}

main();
