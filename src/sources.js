'use strict';

const StateHandler = require('./state_handler').StateHandler;

const TYPES = {
	btde: require('./btde'),
	csde: require('./csde'),
};

function init(cfg, app) {
	const source_configs = cfg('sources');
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

module.exports = {
	init,
};
