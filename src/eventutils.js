'use strict';

const calc = require('../static/calc');

function calc_mscore(scoring, matches) {
	const res = [0, 0];
	for (const m of matches) {
		const mwinner = calc.match_winner(scoring, m.score);
		if (mwinner === 'left') {
			res[0]++;
		} else if (mwinner === 'right') {
			res[1]++;
		}
	}
	return res;
}


module.exports = {
	calc_mscore,
};
