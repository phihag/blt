'use strict';

// Handles the state of one ticker
class StateHandler {
	constructor(app) {
		this.app = app;
		this.ev = {
			id: 'uninitialized',
		};
	}

	on_new_full(new_ev) {
		if (!new_ev.id) {
			throw new Error('Missing event ID!');
		}
		new_ev.last_ticker_update = Date.now();
		this.ev = new_ev;
		// TODO notify all WebSocket clients
	}
}

module.exports = {
	StateHandler,
};
