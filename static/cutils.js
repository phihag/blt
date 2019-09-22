var cutils = (function() {
'use strict';

function find(ar, cb) {
	for (var i = 0;i < ar.length;i++) {
		if (cb(ar[i])) {
			return ar[i];
		}
	}
	return null;
}

function map(ar, cb) {
	var res = [];
	for (var i = 0;i < ar.length;i++) {
		res.push(cb(ar[i]));
	}
	return res;
}

// Returns a value between 0 (extremely dark) and 1 (extremely bright)
function brightness(rgb_str) {
	// formula from https://www.w3.org/TR/AERT#color-contrast
	var m = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/.exec(rgb_str);
	if (!m) {
		return; // undefined
	}

	return (
		0.299 * parseInt(m[1], 16) + // r
		0.587 * parseInt(m[2], 16) + // g
		0.114 * parseInt(m[3], 16)   // b
	);
}

var _cache = {};
function cached_brightness(rgb_str) {
	if (_cache[rgb_str] === undefined) {
		_cache[rgb_str] = brightness(rgb_str);
	}
	return _cache[rgb_str];
}

function color_css(bg_col) {
	var res = 'background:' + bg_col + ';';
	if (cached_brightness(bg_col) < 135) {
		res += 'color:#fff;';
	}
	return res;
}

function root_url() {
	return uiu.qs('.bbt_root').getAttribute('data-rooturl') || 'https://b.aufschlagwechsel.de/';
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

return {
	brightness: brightness,
	cached_brightness: cached_brightness,
	color_css: color_css,
	deep_equal: deep_equal,
	find: find,
	root_url: root_url,
	map: map,
};
})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	module.exports = cutils;

	var uiu = null;
}
/*/@DEV*/
