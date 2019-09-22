'use strict';

document.addEventListener('DOMContentLoaded', function() {
	var events = JSON.parse(uiu.qs('.bbt_events').getAttribute('data-initial-json'));
	cvissel.init_ui();
	crender.init(events);
	wsclient.init(events);

	var h = window.location.hash.substring(1);
	if (h && events) {
		var end_events = events.slice(-3);
		var add_space = end_events.some(function(ev) {
			if (!ev.team_names) return false;
			return (
				(extradata.shortname(ev.team_names[0]) === h) ||
				(extradata.shortname(ev.team_names[1]) === h)
			);
		});
		if (add_space) {
			document.getElementById('extra_space').setAttribute('style', 'height:85vh;');
		}
	}
});


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var crender = null;
	var cvissel = null;
	var extradata = null;
	var uiu = null;
	var wsclient = null;
}
/*/@DEV*/
