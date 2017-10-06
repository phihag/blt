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

function root_url() {
	return uiu.qs('.bbt_root').getAttribute('data-rooturl') || 'https://b.aufschlagwechsel.de/';
}

return {
	brightness: brightness,
	cached_brightness: cached_brightness,
	find: find,
	root_url: root_url,
};
})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	module.exports = cutils;

	var uiu = null;
}
/*/@DEV*/
