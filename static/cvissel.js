'use strict';
var cvissel = (function() {

var DEFAULT_PREFS = {
	'1BL-2020': true,
	'2BLN-2020': true,
	'2BLS-2020': true,
	'RLW-2016': false,
};
var ALL_LEAGUES = Object.keys(DEFAULT_PREFS);

var prefs = JSON.parse(JSON.stringify(DEFAULT_PREFS)); // ... not available in IE
var lkeys = [];

function has_localStorage() {
	try {
		return (typeof localStorage !== 'undefined') && localStorage;
	} catch (_) {
		// SecurityException
		return false;
	}
}

function init_ui() {
	clear_checkboxes();
	if (!has_localStorage()) {
		return;
	}
	var new_prefs_json = localStorage.getItem('bbt_vissel_prefs');
	if (new_prefs_json) {
		prefs = JSON.parse(new_prefs_json);

		if (Object.keys(prefs).some(league_key => !ALL_LEAGUES.includes(league_key))) {
			// Configuration from last season, restore to defaults
			prefs = JSON.parse(JSON.stringify(DEFAULT_PREFS));
		}

		update();
	}

	init_nothing_warning();
}

function init_nothing_warning() {
	var warning_el = document.querySelector('.bbt_nothing_warning');
	if (!warning_el) return;

	uiu.el(warning_el, 'div', '', 'Heute keine Spiele in den gewählten Ligen');
	const show_link = uiu.el(warning_el, 'div', {
		'class': 'pseudo_link',
		style: 'margin-top: 0.2em;',
	}, 'Alle Ligen anzeigen');
	show_link.addEventListener('click', function() {
		var checkboxes = document.querySelectorAll('.bbt_vissel input[type="checkbox"]');
		for (var cb of Array.from(checkboxes)) {
			prefs[cb.getAttribute('name')] = true;
			cb.checked = true;
		}

		save();
		update();
	});
}

function update() {
	var all_hidden = true;
	uiu.qsEach('.bbt_event,.bbt_shortcut', function(el) {
		var visible = is_visible(el.getAttribute('data-league_key'));
		if (visible) {
			all_hidden = false;
		}
		uiu.setClass(el, 'bbt_invisible', !visible);
	});

	update_nothing_warning(all_hidden);
}

function update_nothing_warning(show) {
	var warning_el = document.querySelector('.bbt_nothing_warning');
	if (warning_el) {
		uiu.setClass(warning_el, 'bbt_invisible', !show);
	} else {
		report_problem.silent_error('Missing .bbt_nothing_warning');
	}
}

function on_add_event(event) {
	if (is_visible(event.league_key)) {
		update_nothing_warning(false);
	}
}

function save() {
	if (!has_localStorage()) {
		return;
	}
	try {
		localStorage.setItem('bbt_vissel_prefs', JSON.stringify(prefs));
	} catch (e) {
		report_problem.silent_error('setItem failed: ' + e.stack);
	}
}

function clear_checkboxes() {
	lkeys = [];
	rerender();
}

function add_league(league_key) {
	if (!league_key) {
		return; // uninitialized event
	}

	if (lkeys.indexOf(league_key) >= 0) {
		return;
	}

	lkeys.push(league_key);
	lkeys.sort();
	rerender();
}

function is_visible(league_key) {
	return prefs[league_key] !== false;
}

function rerender() {
	var vissel_container = document.querySelector('.bbt_vissel');
	if (!vissel_container) {
		return; // No UI enabled (embed mode)
	}
	uiu.empty(vissel_container);
	lkeys.forEach(function(lk) {
		var lbl = uiu.el(vissel_container, 'label');
		var cb = uiu.el(lbl, 'input', {
			type: 'checkbox',
			name: lk,
		});
		if (is_visible(lk)) {
			cb.setAttribute('checked', 'checked');
		}
		cb.addEventListener('change', function() {
			prefs[cb.getAttribute('name')] = cb.checked;
			save();
			update();
		});
		uiu.el(lbl, 'span', {}, extradata.name_by_league(lk));
	});
}

return {
	init_ui: init_ui,
	clear_checkboxes: clear_checkboxes,
	add_league: add_league,
	is_visible: is_visible,
	on_add_event: on_add_event,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var uiu = null;
	var extradata = null;
	var report_problem = null;
	module.exports = cvissel;
}
/*/@DEV*/
