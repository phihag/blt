'use strict';

var report_problem = (function() {

var REPORT_URL = 'https://aufschlagwechsel.de/bupbug/';
var last_error = '-';
var reported_count = 0;


function get_info() {
	return {
		ua: window.navigator.userAgent,
		url: window.location.href,
		size: document.documentElement.clientWidth + 'x' + document.documentElement.clientHeight,
		screen: window.screen.width + 'x' + window.screen.height,
		last_error: last_error,
		reported_count: reported_count,
	};
}

function _send(obj) {
	var json_report = JSON.stringify(obj);
	var xhr = new XMLHttpRequest();
	xhr.open('POST', REPORT_URL, true);
	xhr.setRequestHeader('Content-type', 'text/plain');  // To be a simple CORS request (avoid CORS preflight)
	xhr.send(json_report);
}

function report(info_obj) {
	var bbt_root = document.getElementsByClassName('bbt_root')[0];
	var enabled = bbt_root.getAttribute('data-reporting-enabled') === 'true';

	if (!enabled) {
		return;
	}

	reported_count++; // eslint-disable-line no-unreachable
	if (reported_count > 5) {
		return;
	}

	info_obj._type = 'bbt-error';
	_send(info_obj);
}

function on_error(msg, script_url, line, col, err) {
	last_error = {
		msg: msg,
		script_url: script_url,
		line: line,
		col: col,
	};
	if (err) {
		last_error.stack = err.stack;
	}
	report(get_info());
}

function silent_error(msg) {
	console.error(msg); // eslint-disable-line no-console
	/*@DEV*/
	if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
		return;
	}
	/*/@DEV*/

	last_error = {
		msg: msg,
		type: 'silent-error',
	};
	report(get_info());
}

if (typeof window !== 'undefined') {
	window.onerror = on_error;
}

return {
	silent_error: silent_error,
};

})();


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	module.exports = report_problem;
}
/*/@DEV*/
