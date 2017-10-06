'use strict';

const fs = require('fs');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const {StringDecoder} = require('string_decoder');

function broadcast(wss, msg) {
	const json_msg = JSON.stringify(msg);

	for (const client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(json_msg);
		}
	}
}

/*
func gets called with (err, next_interval).
Both arguments must always be present.
*/
function run_every(func) {
	function cb(err, next_interval) {
		if (err) {
			console.error('Error during run: ' + err.stack); // eslint-disable-line no-console
		}
		setTimeout(() => run_every(func), next_interval);
	}

	try {
		func(cb);
	} catch(e) {
		console.error('Uncaught error: ' + e.stack + '. Retrying in 10s.'); // eslint-disable-line no-console
		setTimeout(() => run_every(func), 10000);
	}
}

// Callback gets called with (error, response, body as string)
function download_page(url, cb) {
	const http_mod = url.startsWith('https') ? https : http;
	http_mod.get(url, (res) => {
		const chunks = [];

		res.on('data', (chunk) => {
			chunks.push(chunk);
		});
		res.on('end', () => {
			const buf = Buffer.concat(chunks);

			let guess_encoding;
			if (res.headers['content-type'] && res.headers['content-type'].includes('text/html')) {
				const first_bytes = buf.slice(0, 1024);
				const ascii_sd = new StringDecoder('ascii');
				const html_head = ascii_sd.write(first_bytes);
				const m = /(?:<meta\s+charset="|<meta\s+http-equiv="Content-Type"\s*content="[^;]*;\s+charset=)([^"]+)"/i.exec(html_head);
				if (m) {
					guess_encoding = {
						'iso-8859-1': 'latin1',
						'iso-8859-15': 'latin1',
					}[m[1].toLowerCase()];
				}
			}
			const encoding = guess_encoding || 'utf8';

			const sd = new StringDecoder(encoding);
			const body = sd.write(buf);

			cb(null, res, body);
		});
	}).on('error', (e) => {
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

function obj_update(obj, other) {
	for (const key in other) {
		obj[key] = other[key];
	}
}

module.exports = {
	broadcast,
	deep_copy,
	deep_equal,
	download_page,
	find,
	obj_update,
	pad,
	parse_querystring,
	read_json,
	run_every,
};
