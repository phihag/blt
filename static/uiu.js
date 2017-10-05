// ui utils
'use strict';
var uiu = (function() {

function qs(selector, container) {
	if (! container) {
		container = document;
	}

	/*@DEV*/
	var all_nodes = container.querySelectorAll(selector);
	if (all_nodes.length !== 1) {
		throw new Error(all_nodes.length + ' nodes matched by qs ' + selector);
	}
	/*/@DEV*/

	var node = container.querySelector(selector);
	if (! node) {
		report_problem.silent_error('Expected to find qs  ' + selector + ' , but no node matching.');
		return;
	}
	return node;
}

function empty(node) {
	var last;
	while ((last = node.lastChild)) {
		node.removeChild(last);
	}
}

function text(node, str) {
	empty(node);
	node.appendChild(node.ownerDocument.createTextNode(str));
}

function text_qs(selector, str) {
	text(qs(selector), str);
}

function el(parent, tagName, attrs, text) {
	var doc = parent ? parent.ownerDocument : document;
	var el = doc.createElement(tagName);
	if (attrs) {
		if (typeof attrs === 'string') {
			attrs = {
				'class': attrs,
			};
		}
		for (var k in attrs) {
			el.setAttribute(k, attrs[k]);
		}
	}
	if ((text !== undefined) && (text !== null)) {
		el.appendChild(doc.createTextNode(text));
	}
	if (parent) {
		parent.appendChild(el);
	}
	return el;
}

return {
	empty: empty,
	el: el,
	qs: qs,
	text: text,
	text_qs: text_qs,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var report_problem = null; // avoid circular import, should really be require('./report_problem');

	module.exports = uiu;
}
/*/@DEV*/
