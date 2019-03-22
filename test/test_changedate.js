'use strict';

const assert = require('assert');

const changedate = require('../src/changedate');

describe('changedate', () => {
	it('next_date', () => {
		const teammatches = [
			{date: '2018-10-01'},
			{date: '2018-10-01'},
			{date: '2018-10-02'},
			{date: '2018-10-02'},
			{date: '2018-11-11'},
			{date: '2018-11-11'},
			{date: '2019-01-09'},
			{date: '2019-01-09'},
			{date: '2019-01-09'},
			{date: '2019-03-30'},
		];

		assert.strictEqual(changedate.next_date(teammatches, '2018-09-09'), '2018-10-01');
		assert.strictEqual(changedate.next_date(teammatches, '2018-10-01'), '2018-10-01');
		assert.strictEqual(changedate.next_date(teammatches, '2018-10-02'), '2018-10-02');
		assert.strictEqual(changedate.next_date(teammatches, '2018-10-03'), '2018-11-11');
		assert.strictEqual(changedate.next_date(teammatches, '2018-12-12'), '2019-01-09');
		assert.strictEqual(changedate.next_date(teammatches, '2019-01-08'), '2019-01-09');
		assert.strictEqual(changedate.next_date(teammatches, '2019-01-09'), '2019-01-09');
		assert.strictEqual(changedate.next_date(teammatches, '2019-01-10'), '2019-03-30');
		assert.strictEqual(changedate.next_date(teammatches, '2019-03-30'), '2019-03-30');
		assert.strictEqual(changedate.next_date(teammatches, '2019-04-01'), '2019-03-30');
		assert.strictEqual(changedate.next_date(teammatches, '2022-01-01'), '2019-03-30');
	});
});
