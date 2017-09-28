const async = require('async');
const express = require('express');
const http = require('http');

const ws_module = require('ws');

const config = require('./config');
const sources = require('./sources');
const routes = require('./routes');


function setup_ws(app, ws, req) {
	const events = app.state_handlers.map(sh => sh.ev);
	ws.send(JSON.stringify({
		type: 'init',
		events: events,
	}));
}


function run_server(cfg, source_configs) {
	const server = http.createServer();
	const wss = new ws_module.Server({server});
	const app = express();

	app.cfg = cfg;
	app.root_path = cfg('root_path');
	app.state_handlers = sources.init(cfg, source_configs, wss);

	wss.on('connection', (ws, req) => setup_ws(app, ws, req));

	routes.setup(cfg, app);

	server.on('request', app);
	server.listen(cfg('port'), () => {});
}

function main() {
	async.waterfall([
		config.load,
		(cfg, cb) => sources.load_configs((err, source_configs) => cb(err, cfg, source_configs)),
	], (err, cfg, source_configs) => {
		if (err) {
			throw err;
		}
		run_server(cfg, source_configs);
	});
}

main();
