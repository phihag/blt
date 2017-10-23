'use strict';

const assert = require('assert');

const utils = require('../src/utils');

describe('utils', () => {
	it('parse_querystring', () => {
		assert.deepStrictEqual(
			utils.parse_querystring('http://courtspot.de/php__Skripte/liveabfrage.php?l=1&v=9&g=10'),
			{
				'l': '1',
				'v': '9',
				'g': '10',
			}
		);

		assert.deepStrictEqual(
			utils.parse_querystring('http://courtspot.de/php__Skripte/liveabfrage.php?l=1&v=9&g=10&foobar=a+b%20c&baz=foob%C3%A4r#xx=y'),
			{
				'l': '1',
				'v': '9',
				'g': '10',
				'foobar': 'a b c',
				'baz': 'foobär',
			}
		);
	});

	it('deep_equal', () => {
		assert(!utils.deep_equal({
			foo: 1,
			bar: 2,
		}, {
			bar: 2,
		}));
		assert(utils.deep_equal({
			foo: 1,
			bar: 2,
		}, {
			bar: 2,
		}, ['foo']));
		assert(!utils.deep_equal({
			foo: 1,
			bar: 2,
		}, {
			bar: 3,
		}, ['foo']));
		assert(utils.deep_equal({
			foo: 1,
			bar: 2,
		}, {
			bar: 3,
		}, ['foo', 'bar']));
		assert(utils.deep_equal({
			sub: {
				foo: 1,
			},
		}, {
			sub: {
				foo: 1,
			},
		}, ['foo']));
		assert(!utils.deep_equal({
			sub: {
				foo: 1,
			},
		}, {
			sub: {
				foo: 2,
			},
		}, ['foo']));
	});

	it('parseXML', () => {
		const [err, doc] = utils.parseXML('<foo>a</foo>');
		assert(!err);
		assert(doc);
		assert.strictEqual(doc.documentElement.tagName, 'foo');
		assert.strictEqual(doc.documentElement.textContent, 'a');

		const [errmsg, _] = utils.parseXML('<<x');
		assert.deepStrictEqual(errmsg, '[xmldom error]\tunexpected end of input\n@#[line:undefined,col:undefined]');
	});
});
