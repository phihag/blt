'use strict';

const source_helper = require('./source_helper');

function watch(cfg, src, sh) {
	const event = {
		admin_note: (src.admin_note || 'Diese Begegnung wird nicht getickert.'),
	};
	source_helper.copy_props(event, src);
	sh.on_new_full(event);
}

function setup_tm(tm, home_team) {

}

module.exports = {
	watch,
	setup_tm,
};
