'use strict';

var wsclient = (function() {
var events = [];
var ws;
var timeout;

function _construct_url(abspath) {
	var l = window.location;
	return (
		((l.protocol === 'https:') ? 'wss://' : 'ws://') +
		l.hostname +
		(((l.port !== 80) && (l.port !== 443)) ? ':' + l.port : '') +
		abspath
	);
}

function onmessage(ws_msg) {
	var msg = JSON.parse(ws_msg.data);
	console.log('got ' + msg.type + ' message', msg);
	if (msg.type === 'init') {
		events = msg.events;
		render.init(events);
	} else {
		report_problem.silent_error('Unhandled message of type ' + msg.type);
	}
};


function init() {
	var root_path = uiu.qs('body').getAttribute('data-root_path');
	ws = new WebSocket(_construct_url(root_path + 'ws/subscribe'));
	ws.onmessage = onmessage;
}



return {
	init: init,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var uiu = null;
	var report_problem = null;

	module.exports = wsclient;
}
/*/@DEV*/
