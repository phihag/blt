'use strict';

document.addEventListener('DOMContentLoaded', function() {
	var bbt_root = document.querySelector('.bbt_root');
	var root_url = bbt_root.getAttribute('data-rooturl') || 'https://b.aufschlagwechsel.de/';

	var STYLE_FILES = [
		'bbt',
		'embed',
	];
	STYLE_FILES.forEach(function(style_f) {
		var stylesheet = document.createElement('link');
		stylesheet.setAttribute('rel', 'stylesheet');
		stylesheet.setAttribute('href', root_url + 'static/' + style_f + '.css');
		bbt_root.appendChild(stylesheet);
	});

	/*@DEV*/
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
	SCRIPTS.forEach(function(script) {
		var el = document.createElement('script');
		el.src = root_url + 'static/' + script + '.js';
		el.onload = function() {
			if (++loaded_count === SCRIPTS.length) {
				embed_init(bbt_root);
			}
		};
		bbt_root.appendChild(el);
	});

	return;
	/*/@DEV*/

	embed_init(bbt_root); // eslint-disable-line no-unreachable
});

function embed_init(bbt_root) {
	var events = []/*@INSERT_EVENTS_HERE*/;

	uiu.el(bbt_root, 'div', 'bbt_shortcuts');
	uiu.el(bbt_root, 'div', 'bbt_status');
	var main = uiu.el(bbt_root, 'div', {
		style: 'max-width:33em;margin:0 auto;',
	});
	uiu.el(main, 'div', 'bbt_events');

	crender.init(events);
	wsclient.init();
}

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var crender = null;
	var wsclient = null;
}
/*/@DEV*/

