'use strict';

var wsclient = (function() {
var events = [];
var ws;
var timeout;
var keepalive_interval;
var KEEPALIVE_INTERVAL_LENGTH = 200000;
var DEFAULT_TIMEOUT = 500;
var MAX_TIMEOUT = 10000;
var timeout_length = DEFAULT_TIMEOUT;

function _show_status(message) {
	uiu.text_qs('.bbt_status', message);
}

function _construct_url(abspath) {
	if (abspath.includes(':')) {
		return abspath.replace(/^http(s?)/, 'ws$1');
	}

	var l = window.location;
	return (
		((l.protocol === 'https:') ? 'wss://' : 'ws://') +
		l.hostname +
		((l.port && (l.port !== 80) && (l.port !== 443)) ? (':' + l.port) : '') +
		abspath
	);
}

function onmessage(ws_msg) {
	var msg = JSON.parse(ws_msg.data);
	// console.log('got ' + msg.type + ' message', msg);
	if (msg.type === 'init') {
		events = msg.events;
		crender.init(events);
	} else if (msg.type === 'full') {
		var ev = msg.event;
		var found = false;
		for (var i = 0;i < events.length;i++) {
			if (events[i].num === ev.num) {
				events[i] = ev;
				found = true;
				break;
			}
		}
		if (!found) {
			events.push(ev);
		}
		crender.full(ev);
	} else if (msg.type === 'score') {
		var event = cutils.find(events, function(e) {
			return e.num === msg.num;
		});
		var match = cutils.find(event.matches, function(m) {
			return m.name === msg.name;
		});

		match.score = msg.score;
		match.serving = msg.serving;
		crender.updated_score(event, match);
	} else if (msg.type === 'keptalive') {
		// Nothing to do here.
	} else if (msg.type === 'error') {
		_show_status('Fehler vom Server: ' + msg.message);
	} else {
		report_problem.silent_error('Unhandled message of type ' + msg.type);
	}
}

function init() {
	if (timeout) {
		clearTimeout(timeout);
		timeout = null;
	}
	if (keepalive_interval) {
		clearInterval(keepalive_interval);
		keepalive_interval = null;
	}
	_show_status('Verbinde ...');

	var ws_url = _construct_url(cutils.root_url() + 'ws/subscribe');
	var new_ws;
	try {
		new_ws = new WebSocket(ws_url);
	} catch(e) {
		reconnect();
		return;
	}
	ws = new_ws;
	ws.onmessage = onmessage;
	ws.onerror = onerror;
	ws.onclose = onclose;
	ws.onopen = onopen;
	keepalive_interval = setInterval(keepalive, KEEPALIVE_INTERVAL_LENGTH);
}

function keepalive() {
	if (!ws) {
		return;
	}

	if (ws.readyState !== WebSocket.OPEN) {
		return;
	}

	var packet_str = JSON.stringify({
		type: 'keepalive',
	});

	ws.send(packet_str);
}

function onopen() {
	timeout_length = DEFAULT_TIMEOUT;
	_show_status('Live.');
}

function reconnect() {
	if (timeout) {
		return; // Already waiting
	}
	_show_status('Verbindung verloren');
	timeout = setTimeout(function() {
		timeout = null;
		init();
	}, timeout_length);
	timeout_length = Math.min(MAX_TIMEOUT, timeout_length * 2);
}

function onerror(e) {
	e.preventDefault();
	if ((this !== ws) || ws === null) {
		return; // outdated message
	}
	ws = null;
	reconnect();
}

function onclose() {
	if ((this !== ws) || ws === null) {
		return; // outdated message
	}
	ws = null;
	reconnect();
}


return {
	init: init,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var uiu = null;
	var crender = null;
	var cutils = null;
	var report_problem = null;

	module.exports = wsclient;
}
/*/@DEV*/
