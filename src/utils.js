'use strict';

const http = require('http');

function run_every(every, func) {
	try {
		func();
	} catch(e) {
		console.error('Uncaught error: ' + e.stack); // eslint-disable-line no-console
	}
	setTimeout(() => run_every(every, func), every);
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

function deep_equal(x, y, except_key) {
	if (x === y) {
		return true;
	}
	if ((x === null) || (y === null)) {
		return false;
	}
	if ((typeof x == 'object') && (typeof y == 'object')) {
		var key_count = 0;
		for (var k in x) {
			if (k === except_key) {
				continue;
			}
			if (! deep_equal(x[k], y[k])) {
				return false;
			}
			key_count++;
		}

		for (k in y) {
			if (k === except_key) {
				continue;
			}
			key_count--;
		}
		return key_count === 0;
	}
	return false;
}

module.exports = {
	deep_equal,
	download_page,
	find,
	parse_querystring,
	run_every,
};
