'use strict';

var calc = (function() {

function is_winner(counting, game_idx, candidate, other) {
	if ((counting === '3x21') || (counting === '1x21') || ((counting === '2x21+11') && (game_idx < 2))) {
		return (
			((candidate == 21) && (other < 20)) ||
			((candidate > 21) && (candidate <= 30) && (other == candidate - 2)) ||
			(candidate == 30) && (other == 29)
		);
	}
	if ((counting === '5x11_15') || (counting === '5x11_15^90') || (counting === '1x11_15') || ((counting === '2x21+11') && (game_idx === 2))) {
		return (
			((candidate == 11) && (other < 10)) ||
			((candidate > 11) && (candidate <= 15) && (other == candidate - 2)) ||
			(candidate == 15) && (other == 14)
		);
	}
	if (counting === '5x11/3') {
		return (
			((candidate == 11) && (other < 10)) ||
			((candidate == 13) && (other >= 10) && (other < 13))
		);
	}
	if (counting === '3x15_18') {
		return (
			((candidate == 15) && (other < 14)) ||
			((candidate > 15) && (candidate <= 18) && (other == candidate - 2)) ||
			(candidate == 18) && (other == 17)
		);
	}
	if (counting === '5x11_11') {
		return (candidate === 11) && (other < 11);
	}

	throw new Error('Invalid counting scheme ' + counting);
}

// Returns:
//  'inprogress' for game in progress
//  'invalid' if the score can't happen
//  'left' if left side won this game
//  'right' if right side won this game
function game_winner(counting, game_idx, left_score, right_score) {
	if (is_winner(counting, game_idx, left_score, right_score)) {
		return 'left';
	}
	if (is_winner(counting, game_idx, right_score, left_score)) {
		return 'right';
	}
	if ((counting === '3x21') || (counting === '1x21') || ((counting === '2x21+11') && (game_idx < 2))) {
		if ((left_score < 21) && (right_score < 21)) {
			return 'inprogress';
		}
		if ((left_score < 30) && (right_score >= left_score - 1) && (right_score <= left_score + 1)) {
			return 'inprogress';
		}
	} else if ((counting === '5x11_15') || (counting === '5x11_15^90') || (counting === '1x11_15') || ((counting === '2x21+11') && (game_idx === 2))) {
		if ((left_score < 11) && (right_score < 11)) {
			return 'inprogress';
		}
		if ((left_score < 15) && (right_score >= left_score - 1) && (right_score <= left_score + 1)) {
			return 'inprogress';
		}
	} else if (counting === '5x11_11') {
		if ((left_score < 11) && (right_score < 11)) {
			return 'inprogress';
		}
	} else if (counting === '5x11/3') {
		if ((left_score < 11) && (right_score < 11)) {
			return 'inprogress';
		}
		if ((left_score >= 10) && (left_score < 13) && (right_score >= 10) && (right_score < 13)) {
			return 'inprogress';
		}
	} else if (counting === '3x15_18') {
		if ((left_score < 15) && (right_score < 15)) {
			return 'inprogress';
		}
		if ((left_score < 18) && (right_score >= left_score - 1) && (right_score <= left_score + 1)) {
			return 'inprogress';
		}
	}
	return 'invalid';
}

function winning_game_count(counting) {
	switch (counting) {
	case '5x11_15':
	case '5x11_15^90':
	case '5x11/3':
	case '5x11_11':
		return 3;
	case '3x21':
	case '2x21+11':
	case '3x15_18':
		return 2;
	case '1x21':
	case '1x11_15':
		return 1;
	default:
		throw new Error('Invalid counting scheme ' + counting);
	}
}

function max_game_count(counting) {
	switch (counting) {
	case '5x11_15':
	case '5x11_15^90':
	case '5x11/3':
	case '5x11_11':
		return 5;
	case '3x21':
	case '3x15_18':
	case '2x21+11':
		return 3;
	case '1x21':
	case '1x11_15':
		return 1;
	default:
		throw new Error('Invalid counting scheme ' + counting);
	}
}

function match_winner(counting, input_scores) {
	var winning_count = winning_game_count(counting);

	var score = [0, 0];
	for (var i = 0;i < input_scores.length;i++) {
		var iscore = input_scores[i];
		var winner = iscore.winner;
		if (!winner) {
			winner = game_winner(counting, i, iscore[0], iscore[1]);
		}
		switch (winner) {
		case 'left':
			score[0]++;
			if (score[0] >= winning_count) {
				return 'left';
			}
			break;
		case 'right':
			score[1]++;
			if (score[1] >= winning_count) {
				return 'right';
			}
			break;
		case 'inprogress':
			return 'inprogress';
		case 'invalid':
			return 'invalid';
		}
	}
	return 'inprogress';
}

return {
	max_game_count: max_game_count,
	match_winner: match_winner,
	is_winner: is_winner,
};

})();


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	module.exports = calc;
}
/*/@DEV*/
