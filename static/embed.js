'use strict';

document.addEventListener('DOMContentLoaded', function() {
	/*@DEV*/
	var root_url = document.querySelector('.bbt_root').getAttribute('data-rooturl') || 'https://b.aufschlagwechsel.de/';
	var SCRIPTS = [
		'compat',
		'report_problem',
		'calc',
		'extradata',
		'crender',
		'cutils',
		'uiu',
		'wsclient',
	];
	var loaded_count = 0;
	var body = document.querySelector('body');
	SCRIPTS.forEach(function(script) {
		var el = document.createElement('script');
		el.src = root_url + 'static/' + script + '.js';
		el.onload = function() {
			if (++loaded_count === SCRIPTS.length) {
				embed_init();
			}
		};
		body.appendChild(el);
	});
	return;
	/*/@DEV*/

	embed_init(); // eslint-disable-line no-unreachable
});

function embed_init() {
	var events = []/*@INSERT_EVENTS_HERE*/;

	crender.init(events);
	wsclient.init();
}

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var crender = null;
	var wsclient = null;
}
/*/@DEV*/

