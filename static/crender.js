'use strict';

var crender = (function() {

function _render_logo(container, team_name) {
	var static_path = uiu.qs('body').getAttribute('data-static_path');
	var logo_url = static_path + extradata.team_logo(team_name);
	uiu.el(container, 'img', {
		src: logo_url,
	});
}

function render_match(table, ev, team_colors, max_game_count, match) {
	uiu.empty(table);

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
		var player_names = uiu.el(tr, 'td', {
			'class': 'player_names',
			style: (
				(won_match ? 'background:' + team_colors[team_id] + ';' : '')
			),
		});
		match.players[team_id].forEach(function(player, player_id) {
			if (player_id > 0) {
				uiu.el(player_names, 'span', 'player_sep', ' / ');
			}
			uiu.el(player_names, 'span', 'player_name', player.name);
		});

		for (var game_id = 0;game_id < max_game_count;game_id++) {
			var gscore = match.score ? match.score[game_id] : null;
			var highlight = gscore && (
				calc.is_winner(ev.scoring, game_id, gscore[team_id], gscore[1 - team_id]) ||
				((game_id === match.score.length - 1) && (match.serving === team_id))
			);
			uiu.el(
				tr, 'td', {
					'class': 'score',
					style: (
						(highlight ? 'background:' + team_colors[team_id] + ';' : '')
					),
				},
				gscore ? gscore[team_id] : '');
		}
	}
}

function render_event(container, ev) {
	uiu.empty(container);
	var max_game_count = calc.max_game_count(ev.scoring);
	var team_colors = ev.team_names.map(extradata.get_color);

	var header = uiu.el(container, 'table', 'header');
	var header_tr = uiu.el(header, 'tr');
	var home_logo_td = uiu.el(header_tr, 'td', 'logo');
	_render_logo(home_logo_td, ev.team_names[0]);
	uiu.el(header_tr, 'td', 'team_name', ev.team_names[0]);
	uiu.el(header_tr, 'td', 'mscore', ev.mscore[0] + ':' + ev.mscore[1]);
	uiu.el(header_tr, 'td', {
		'class': 'team_name',
		style: 'text-align: right;',
	}, ev.team_names[1]);
	var away_logo_td = uiu.el(header_tr, 'td', {
		'class': 'logo',
		style: 'text-align: right;',
	});
	_render_logo(away_logo_td, ev.team_names[1]);

	ev.matches.forEach(function(match) {
		var table = uiu.el(container, 'table', {
			'data-match-name': match.name,
			'class': 'match',
		});
		render_match(table, ev, team_colors, max_game_count, match);
	});

	var footer = uiu.el(container, 'div', 'footer');
	uiu.el(footer, 'a', {
		href: ev.link,
	}, 'Original-Liveticker');
}

function add_event(ev) {
	var events_container = uiu.qs('.events');
	var container = uiu.el(events_container, 'div', {
		'class': 'event',
		'data-event-num': ev.num,
	});
	render_event(container, ev);
}

function init(initial_events) {
	initial_events.forEach(function(ev) {
		full(ev);
	});
}

function full(ev) {
	var cur_container = document.querySelector('.event[data-event-num="' + ev.num + '"]');
	if (cur_container) {
		render_event(cur_container, ev);
	} else {
		add_event(ev);
	}
}

function updated_score(ev, match) {
	var match_table = uiu.qs('.event[data-event-num="' + ev.num + '"] .match[data-match-name="' + match.name + '"]');

	var max_game_count = calc.max_game_count(ev.scoring);
	var team_colors = ev.team_names.map(extradata.get_color);

	render_match(match_table, ev, team_colors, max_game_count, match);
}

return {
	init: init,
	full: full,
	updated_score: updated_score,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var calc = null;
	var extradata = null;
	var uiu = null;

	module.exports = crender;
}
/*/@DEV*/
