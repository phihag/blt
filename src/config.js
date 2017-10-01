'use strict';

const path = require('path');

const utils = require('./utils');

function load(cb) {
	const fn = path.dirname(__dirname) + '/config.json';
	utils.read_json(fn, (err, config_data) => {
		if (err) return cb(err);

		const local_fn = path.dirname(__dirname) + '/localconfig.json';
		utils.read_json(local_fn, (err, localconfig) => {
			if (err) {
				if (err.code !== 'ENOENT') {
					return cb(err);
				}
			} else {
				utils.obj_update(config_data, localconfig);
			}
			cb(null, function get_from_config(key, def) {
				if (! (key in config_data)) {
					if (def !== undefined) {
						return def;
					}
					throw new Error('Cannot find configuration key ' + JSON.stringify(key));
				}
				return config_data[key];
			});
		});
	});
}

module.exports = {
	load: load,
};
