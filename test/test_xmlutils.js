'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const xmldom = require('xmldom');

const xmlutils = require('../src/xmlutils');

describe('xmlutils', () => {
	it('getElementsByClassName: basic functionality', (done) => {
		const fn = path.join(__dirname, 'testdata', 'xml_test1.xml');
		fs.readFile(fn, {encoding: 'utf8'}, (err, xml) => {
			if (err) return done(err);

			const parser = new xmldom.DOMParser();
			const doc = parser.parseFromString(xml, 'text/xml');

			const b = xmlutils.getElementsByClassName(doc, 'b');
			assert.strictEqual(b.length, 4);
			assert.strictEqual(b[0].textContent, 'b1');
			assert.strictEqual(b[1].textContent, 'b3');
			assert.strictEqual(b[3].tagName, 'anothersub');
			assert.strictEqual(b[3].textContent, 'b5');

			const c = xmlutils.getElementsByClassName(doc, 'c');
			assert.strictEqual(c.length, 2);
			assert.strictEqual(c[0].textContent, 'c2');
			assert.strictEqual(c[0].tagName, 'bar');
			assert.strictEqual(c[1].tagName, 'baz');

			const subb = xmlutils.getElementsByClassName(c[1], 'b');
			assert.strictEqual(subb.length, 3);
			assert.strictEqual(subb[0].tagName, 'subchild');
			assert.strictEqual(subb[1].tagName, 'gp');
			assert.strictEqual(subb[2].tagName, 'anothersub');

			done();
		});
	});

	it('getElementsByClassName: real-world example', (done) => {
		const fn = path.join(__dirname, 'testdata', 'getElementsByClassName1.xml');
		fs.readFile(fn, {encoding: 'utf8'}, (err, xml) => {
			if (err) return done(err);

			const parser = new xmldom.DOMParser();
			const doc = parser.parseFromString(xml, 'text/html');

			const match_el = xmlutils.getElementsByClassName(doc, 'match')[0];
			assert(match_el);

			const game_nodes = xmlutils.getElementsByClassName(doc, 'game');
			assert.strictEqual(game_nodes.length, 1);
			assert(game_nodes[0]);

			done();
		});
	});

	it('child_texts', () => {
		const parser = new xmldom.DOMParser();
		const doc = parser.parseFromString('<root>a<br/>b<br/>c<sub>d</sub>e</root>', 'text/xml');

		assert.deepStrictEqual(
			xmlutils.child_texts(doc.documentElement),
			['a', 'b', 'c', 'e']);
	});
});
