'use strict';

const fs = require('fs');
const http = require('http');
const WebSocket = require('ws');

function broadcast(wss, msg) {
	const json_msg = JSON.stringify(msg);

	for (const client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(json_msg);
		}
	}
}

function run_every(every, func) {
	function cb(err) {
		if (err) {
			console.error('Error during run: ' + err.stack); // eslint-disable-line no-console
		}
		setTimeout(() => run_every(every, func), every);
	}

	try {
		func(cb);
	} catch(e) {
		console.error('Uncaught error: ' + e.stack); // eslint-disable-line no-console
		setTimeout(() => run_every(every, func), every);
	}

}

// Callback gets called with (error, response, body as string)
function download_page(url, cb) {
	http.get(url, function(res) {
		res.setEncoding('utf8'); // TODO read actual page encoding
		let body = '';
		res.on('data', function(chunk) {
			body += chunk;
		});
		res.on('end', function() {
			cb(null, res, body);
		});
	}).on('error', function(e) {
		cb(e, null, null);
	});
}

function find(ar, cb) {
	for (var i = 0;i < ar.length;i++) {
		if (cb(ar[i])) {
			return ar[i];
		}
	}
	return null;
}

function parse_querystring(url) {
	// Adapted from https://stackoverflow.com/a/3855394/35070

	const query_m = /^[^?]+\?([^#]*)(?:#.*)?$/.exec(url);
	if (! query_m) {
		return {};
	}
	const query = query_m[1];

	return query.split('&').reduce((res, param) => {
		const [key, value] = param.split('=');
		res[key] = value ? decodeURIComponent(value.replace(/\+/g, ' ')) : '';
		return res;
	}, {});
}

function deep_equal(x, y, except_keys) {
	if (x === y) {
		return true;
	}
	if ((x === null) || (y === null)) {
		return false;
	}
	if ((typeof x == 'object') && (typeof y == 'object')) {
		var key_count = 0;
		for (var k in x) {
			if (except_keys && except_keys.includes(k)) {
				continue;
			}
			if (! deep_equal(x[k], y[k])) {
				return false;
			}
			key_count++;
		}

		for (k in y) {
			if (except_keys && except_keys.includes(k)) {
				continue;
			}
			key_count--;
		}
		return key_count === 0;
	}
	return false;
}

function deep_copy(obj) {
	if (obj === undefined) {
		return obj;
	}
	return JSON.parse(JSON.stringify(obj));
}

function read_json(fn, callback) {
	fs.readFile(fn, (err, json) => {
		if (err) return callback(err);
		return callback(null, JSON.parse(json));
	});
}

function pad(n, width, z) {
	z = z || '0';
	width = width || 2;
	n = n + '';
	return n.length >= width ? n : (new Array(width - n.length + 1).join(z) + n);
}

module.exports = {
	broadcast,
	deep_copy,
	deep_equal,
	download_page,
	find,
	pad,
	parse_querystring,
	read_json,
	run_every,
};
