const async = require('async');
const express = require('express');
const http = require('http');

const config = require('./config');
const sources = require('./sources');
const routes = require('./routes');


function run_server(cfg, source_configs) {
	const server = http.createServer();
	const app = express();

	app.cfg = cfg;
	app.root_path = cfg('root_path');
	app.state_handlers = sources.init(cfg, source_configs, app);

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
