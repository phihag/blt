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
});
