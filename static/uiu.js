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

// From https://plainjs.com/javascript/attributes/adding-removing-and-testing-for-classes-9/
var hasClass, addClass, removeClass;
if (typeof document != 'undefined') {
	if ('classList' in document.documentElement) {
		hasClass = function(el, className) {
			return el.classList.contains(className);
		};
		addClass = function(el, className) {
			el.classList.add(className);
		};
		removeClass = function(el, className) {
			el.classList.remove(className);
		};
	} else {
		hasClass = function (el, className) {
			return new RegExp('\\b'+ className+'\\b').test(el.className);
		};
		addClass = function (el, className) {
			if (!hasClass(el, className)) {
				el.className += ' ' + className;
			}
		};
		removeClass = function (el, className) {
			el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
		};
	}
}

function setClass(el, className, enabled) {
	if (enabled) {
		addClass(el, className);
	} else {
		removeClass(el, className);
	}
}

function qsEach(selector, func, container) {
	if (!container) {
		container = document;
	}
	var nodes = container.querySelectorAll(selector);
	for (var i = 0;i < nodes.length;i++) {
		func(nodes[i], i);
	}
}

return {
	empty: empty,
	el: el,
	qs: qs,
	qsEach: qsEach,
	text: text,
	text_qs: text_qs,
	setClass: setClass,
};

})();

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var report_problem = null; // avoid circular import, should really be require('./report_problem');

	module.exports = uiu;
}
/*/@DEV*/
