'use strict';

const assert = require('assert');

function _traverse_els(node, cb) {
	if (node.nodeType === 9) {
		// Called on a document
		assert(node.documentElement);
		return _traverse_els(node.documentElement, cb);
	}

	if (node.nodeType !== 1) {
		return; // Not an element, don't care
	}

	cb(node);

	const children = node.childNodes;
	for (let i = 0;i < children.length;i++) {
		const c = children[i];
		_traverse_els(c, cb);
	}
}

function find_els(node, filter_cb) {
	const res = [];
	_traverse_els(node, (el) => {
		if (filter_cb(el)) {
			res.push(el);
		}
	});
	return res;
}

function getElementsByClassName(node, className) {
	return find_els(node, el => {
		const class_attr = el.getAttribute('class');
		if (! class_attr) {
			return false;
		}
		return class_attr.split(/\s+/).includes(className);
	});
}

function child_texts(el) {
	const res = [];
	const children = el.childNodes;
	for (let i = 0;i < children.length;i++) {
		const c = children[i];
		if (c.nodeType === 3) {
			res.push(c.data);
		}
	}
	return res;
}

module.exports = {
	child_texts,
	getElementsByClassName,
	find_els,
};
