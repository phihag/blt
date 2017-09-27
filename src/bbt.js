const async = require('async');
const express = require('express');
const http = require('http');

const config = require('./config');
const sources = require('./sources');
const routes = require('./routes');


function run_server(cfg) {
	const server = http.createServer();
	const app = express();

	app.cfg = cfg;
	app.root_path = cfg('root_path');
	app.state_handlers = sources.init(cfg, app);

	routes.setup(app);

	server.on('request', app);
	server.listen(cfg('port'), () => {});
}

function main() {
	async.waterfall([
		config.load,
	], (err, cfg) => {
		if (err) {
			throw err;
		}
		run_server(cfg);
	});
}

main();
