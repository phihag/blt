'use strict';

const assert = require('assert');

const utils = require('./utils');


function determine_diff(old_ev, new_ev) {
	if (!utils.deep_equal(old_ev, new_ev, ['matches'])) {
		return 'full';
	}

	if (old_ev.matches === new_ev.matches) {
		return;
	}

	if (!old_ev.matches || !new_ev.matches) {
		return 'full';
	}

	if (old_ev.matches.length !== new_ev.matches.length) {
		return 'full';
	}

	const score_diffs = [];
	for (let match_id = 0;match_id < old_ev.matches.length;match_id++) {
		const old_match = old_ev.matches[match_id];
		const new_match = new_ev.matches[match_id];
		if (!utils.deep_equal(old_match, new_match, ['serving', 'score'])) {
			return 'full';
		}
		if ((old_match.serving !== new_match.serving) || !utils.deep_equal(old_match.score, new_match.score)) {
			score_diffs.push({
				type: 'score',
				num: new_ev.num,
				name: new_match.name,
				score: new_match.score,
				serving: new_match.serving,
			});
		}
	}

	return (score_diffs.length > 0) ? score_diffs : null;
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
		const diff = determine_diff(this.ev, new_ev);

		if (!diff) {
			return; // No change at all
		}

		this.ev = new_ev;
		if (diff === 'full') {
			utils.broadcast(this.wss, {
				type: 'full',
				event: this.ev,
			});
		} else {
			for (const sd of diff) {
				utils.broadcast(this.wss, sd);
			}
		}
	}
}

module.exports = {
	StateHandler,
	// Testing only
	determine_diff,
};
