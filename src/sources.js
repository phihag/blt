'use strict';

const fs = require('fs');
const path = require('path');

const StateHandler = require('./state_handler').StateHandler;

const TYPES = {
	btde: require('./btde'),
	csde: require('./csde'),
};

function init(cfg, source_configs, app) {
	const shs = [];
	for (const src of source_configs) {
		if (src.disabled) {
			continue;
		}

		const mod = TYPES[src.type];
		if (!mod) {
			throw new Error('Unsupported source type ' + src.type);
		}

		const sh = new StateHandler(app);
		mod(cfg, src, sh);
		shs.push(sh);
	}
	return shs;
}

function load_configs(callback) {
	const fn = path.join(path.dirname(__dirname), 'sources.json');
	fs.readFile(fn, (err, config_json) => {
		if (err && (err.code === 'ENOENT')) {
			const default_fn = path.join(path.dirname(__dirname), 'default_sources.json');
			fs.readFile(default_fn, (err, config_json) => {
				if (err) return callback(err);

				const source_configs = JSON.parse(config_json);
				return callback(null, source_configs);
			});
			return;
		}

		if (err) return callback(err);

		const source_configs = JSON.parse(config_json);
		return callback(null, source_configs);
	});
}

module.exports = {
	init,
	load_configs,
};
