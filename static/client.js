'use strict';

function players_str(players) {
	if (!players || players.length === 0) {
		return '';
	}

	return players.map(function(p) {
		return p.name;
	}).join(' / ');
}

function add_event(events_container, ev) {
	var max_game_count = calc.max_game_count(ev.scoring);

	var container = uiu.el(events_container, 'div', 'event');
	var header = uiu.el(container, 'div');
	uiu.el(header, 'div', 'team_name', ev.team_names[0]);
	uiu.el(header, 'div', 'mscore', ev.mscore[0] + ':' + ev.mscore[1]);
	uiu.el(header, 'div', 'team_name', ev.team_names[1]);

	ev.matches.forEach(function(match) {
		var table = uiu.el(container, 'table', 'match');

		for (var team_id = 0;team_id < 2;team_id++) {
			var tr = uiu.el(table, 'tr');
			if (team_id === 0) {
				uiu.el(tr, 'td', {
					'class': 'match_name',
					rowspan: 2,
				}, match.name);
			}
			var won_match = (
				calc.match_winner(ev.scoring, match.score) === ((team_id === 0) ? 'left' : 'right'));
			uiu.el(tr, 'td', (won_match ? 'match_winner' : ''), players_str(match.players[team_id]));	
			for (var game_id = 0;game_id < max_game_count;game_id++) {
				var gscore = match.score ? match.score[game_id] : null;
				var highlight = gscore && (
					calc.is_winner(ev.scoring, game_id, gscore[team_id], gscore[1 - team_id]) ||
					(match.serving === team_id)
				);
				uiu.el(
					tr, 'td',
					'score ' + (highlight ? 'score_highlight' : ''),
					gscore ? gscore[team_id] : '');
			}
		}
	});

	var footer = uiu.el(container, 'div', 'footer');
	uiu.el(footer, 'a', {
		href: ev.link,
	}, 'Original-Liveticker');
}

function render_initial() {
	var container = uiu.qs('.events');
	var initial_events = JSON.parse(container.getAttribute('data-initial-json'));
	initial_events.forEach(function(ev) {
		add_event(container, ev);
	});
}

document.addEventListener('DOMContentLoaded', function() {
	render_initial();
});


/*@DEV*/
if ((typeof 	module !== 'undefined') && (typeof require !== 'undefined')) {
	var calc = null;
	var uiu = null;
}
/*/@DEV*/
