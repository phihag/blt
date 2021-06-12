'use strict';

var crender = (function() {

function _render_logo(container, team_name) {
	var logo_url = cutils.root_url() + 'static/' + extradata.team_logo(team_name);
	uiu.el(container, 'img', {
		'class': 'bbt_logo',
		src: logo_url,
	});
}

function render_match(table, ev, team_colors, max_game_count, match) {
	uiu.empty(table);

	var bg_css = [0, 1].map(function(team_id) {
		var bg_col = team_colors[team_id];
		return cutils.color_css(bg_col);
	});

	var match_winner = calc.match_winner(ev.scoring, match.score);

	for (var team_id = 0;team_id < 2;team_id++) {
		var won_match = (match_winner === ((team_id === 0) ? 'left' : 'right'));

		var tr = uiu.el(table, 'tr');
		if (team_id === 0) {
			uiu.el(tr, 'td', {
				'class': 'bbt_match_name',
				style: (match_winner === 'left' ? bg_css[0] : (match_winner === 'right' ? bg_css[1] : '')),
				rowspan: 2,
			}, match.name);
		}
		var player_names_el = uiu.el(tr, 'td', {
			'class': 'bbt_player_names',
			style: (
				(won_match ? 'font-weight:bold;' : '')
			),
		});
		var team_players = match.players ? match.players[team_id] : null;
		if (team_players) {
			team_players.forEach(function(player, player_id) {
				if (player_id > 0) {
					uiu.el(player_names_el, 'span', 'bbt_player_sep', ' / ');
				}
				uiu.el(player_names_el, 'span', 'bbt_player_name', player.name);
			});
		}

		for (var game_id = 0;game_id < max_game_count;game_id++) {
			var gscore = match.score ? match.score[game_id] : null;
			var highlight = gscore && (
				calc.is_winner(ev.scoring, game_id, gscore[team_id], gscore[1 - team_id]) ||
				((game_id === match.score.length - 1) && (match.serving === team_id))
			);
			var row_bg_css = highlight ? bg_css[team_id] : '';

			uiu.el(
				tr, 'td', {
					'class': 'score',
					style: row_bg_css,
				},
				gscore ? gscore[team_id] : '');
		}
	}
}

function render_event(container, shortcut_container, ev) {
	uiu.empty(container);
	uiu.empty(shortcut_container);

	var team_names = ev.team_names;
	if (!team_names) {
		return; // Incomplete
	}
	var max_game_count = calc.max_game_count(ev.scoring || '5x11_15^90');
	var team_colors = team_names.map(extradata.get_color);

	container.setAttribute('id', extradata.shortname(team_names[0]));
	uiu.setClass(container, 'bbt_invisible', !cvissel.is_visible(ev.league_key));
	container.setAttribute('data-league_key', ev.league_key);

	var header = uiu.el(container, 'table', {
		'class': 'bbt_header',
		id: extradata.shortname(team_names[1]),
	});
	var header_tr = uiu.el(header, 'tr');
	var home_td = uiu.el(header_tr, 'td', 'bbt_team_td');
	var home_div = uiu.el(home_td, 'div', 'bbt_team_name_container');
	_render_logo(home_div, team_names[0]);
	uiu.el(home_div, 'span', {
		'class': 'bbt_team_name',
		style: 'padding-left:0.5ch;',
	}, team_names[0]);

	uiu.el(header_tr, 'td', {
		style: 'text-align: center;font-size: 160%;',
	}, (ev.mscore ? (ev.mscore[0] + ':' + ev.mscore[1]) : ''));
	var away_td = uiu.el(header_tr, 'td', {
		'class': 'bbt_team_td',
		style: 'text-align:right;',
	});
	var away_div = uiu.el(away_td, 'div', {
		'class': 'bbt_team_name_container',
		style: 'justify-content:flex-end;',
	});
	uiu.el(away_div, 'span', {
		'class': 'bbt_team_name',
		'style': 'padding-right:0.5ch;',
	}, team_names[1]);
	_render_logo(away_div, team_names[1]);

	var admin_note = ev.admin_note;
	if (admin_note) {
		var bbt_root = uiu.qs('.bbt_root');
		var override_json = bbt_root.getAttribute('data-override-notes-json');
		if (override_json) {
			try {
				var override = JSON.parse(override_json);
				admin_note = override[team_names[0]] || admin_note;
			} catch (e) {
				report_problem.silent_error('Failed to parse data-override-notes-json: ' + e.stack);
			}
		}
	}

	var admin_note_html = ev.admin_note_html;
	if (admin_note || admin_note_html) {
		var div = uiu.el(container, 'div', {
			style: 'white-space:pre-wrap;padding:0.4em 0;color:#000;text-align:center;',
		}, admin_note);

		if (admin_note_html) {
			div.innerHTML = admin_note_html;
		}
	}

	if (ev.live_stream_url) {
		var live_stream_div = uiu.el(container, 'div', {
			style: 'padding:0.4em 0;color:#000;text-align:center;',
		});
		uiu.el(live_stream_div, 'a', {
			href: ev.live_stream_url,
			target: '_blank',
			rel: 'noopener',
		}, ev.live_stream_url);
	}

	if (ev.matches) {
		ev.matches.forEach(function(match) {
			var table = uiu.el(container, 'table', {
				'data-match-name': match.name,
				'class': 'bbt_match',
			});
			render_match(table, ev, team_colors, max_game_count, match);
		});
	} else if (!admin_note && !admin_note_html) {
		uiu.el(container, 'div', {}, 'Ticker noch nicht aktiv');
	}

	var event_note = ev.event_note;
	if (event_note) {
		uiu.el(container, 'div', {
			style: 'white-space:pre-wrap;',
		}, event_note);
	}
	var event_note_html = ev.event_note_html;
	if (event_note_html) {
		var event_note_html_container = uiu.el(container, 'div');
		event_note_html_container.innerHTML = event_note_html;
	}

	var footer = uiu.el(container, 'div', 'footer');
	if (ev.league_key) {
		uiu.el(footer, 'div', 'bbt_footer_info', extradata.name_by_league(ev.league_key));
	}
	if (ev.starttime) {
		var starttime_str = 'Spielbeginn: ';
		if (ev.date) {
			var now = new Date();
			var ymd = ev.date.split('-').map(function(str) {
				return parseInt(str);
			});
			if ((ymd[0] !== now.getFullYear()) || (ymd[1] !== now.getMonth() + 1) || (ymd[2] !== now.getDate())) {
				starttime_str = ymd[2] + '.' + ymd[1] + '. ';
			}
		}
		starttime_str += ev.starttime;
		uiu.el(footer, 'div', 'bbt_footer_info', starttime_str);
	}
	if (ev.link) {
		uiu.el(footer, 'a', {
			href: ev.link,
			target: '_blank',
			rel: 'noopener noreferrer',
		}, 'Original-Liveticker');
	}
	uiu.el(footer, 'div', {
		style: 'clear:both;',
	});

	shortcut_container.setAttribute('data-league_key', ev.league_key);
	uiu.setClass(shortcut_container, 'bbt_invisible', !cvissel.is_visible(ev.league_key));
	cvissel.on_add_event(ev);

	var shortcut_str = extradata.shortname(team_names[0]) + (ev.mscore ? ' ' + ev.mscore[0] + ':' + ev.mscore[1] + ' ' : ' - ') + extradata.shortname(team_names[1]);
	uiu.el(shortcut_container, 'a', {
		href: '#' + extradata.shortname(team_names[0]),
		'style': ((shortcut_str.length > 30) ? 'font-size:80%;' : ''),
	}, shortcut_str);
}

function add_event(ev) {
	var events_container = uiu.qs('.bbt_events');
	var container = uiu.el(events_container, 'div', {
		'class': 'bbt_event',
		'data-event-num': ev.num,
	});

	var shortcuts_container = uiu.qs('.bbt_shortcuts');
	var shortcut_container = uiu.el(shortcuts_container, 'div', {
		'class': 'bbt_shortcut',
		'data-event-num': ev.num,
	});

	render_event(container, shortcut_container, ev);
}

function init(initial_events) {
	uiu.empty(uiu.qs('.bbt_events'));
	uiu.empty(uiu.qs('.bbt_shortcuts'));
	cvissel.clear_checkboxes();
	initial_events.forEach(function(ev) {
		full(ev);
	});
}

function full(ev) {
	var cur_container = document.querySelector('.bbt_event[data-event-num="' + ev.num + '"]');
	var shortcut_container = document.querySelector('.bbt_shortcut[data-event-num="' + ev.num + '"]');
	cvissel.add_league(ev.league_key);

	if (cur_container) {
		render_event(cur_container, shortcut_container, ev);
	} else {
		add_event(ev);
	}
}

function updated_score(ev, match) {
	var match_table = uiu.qs('.bbt_event[data-event-num="' + ev.num + '"] .bbt_match[data-match-name="' + match.name + '"]');

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
	var cutils = null;
	var cvissel = null;
	var extradata = null;
	var report_problem = null;
	var uiu = null;

	module.exports = crender;
}
/*/@DEV*/
