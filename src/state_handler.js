'use strict';

const assert = require('assert');
const WebSocket = require('ws');

const utils = require('./utils');


function _broadcast(wss, msg) {
	const json_msg = JSON.stringify(msg);

	for (const client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(json_msg);
		}
	}
}

// Handles the state of one ticker
class StateHandler {
	constructor(wss, num) {
		assert(num !== undefined);
		this.wss = wss;
		this.num = num;
		this.ev = {
			id: 'uninitialized',
			num,
		};
	}

	on_new_full(new_ev) {
		if (!new_ev.id) {
			throw new Error('Missing event ID!');
		}
		new_ev.num = this.num;
		if (utils.deep_equal(new_ev, this.ev)) {
			return; // Nothing to do, no change
		}

		this.ev = new_ev;

		_broadcast(this.wss, {
			type: 'full',
			event: this.ev,
		});
	}
}

module.exports = {
	StateHandler,
};
