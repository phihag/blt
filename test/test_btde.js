'use strict';

const assert = require('assert');

const btde = require('../src/btde');

describe('btde', () => {
	it('basic parsing', () => {
		const str = '0~6~1~TV Refrath 2~1.BC Beuel 2|1~0~~HHHH00~<span>Völker</span>, Jan-Colin<br><span>Magee</span>, Joshua~<span>Hess</span>, Daniel<br><span>Scheiel</span>, Patrick~12~11~11~~~10~9~7~~|2~0~~GGGG00~<span>Dörr</span>, Anika<br><span>Svensson</span>, Elin~<span>Kaminski</span>, Lisa<br><span>Pohl</span>, Hannah~7~5~6~~~11~11~11~~|3~0~~HHHGGH~<span>Offermann</span>, Christoph<br><span>Waldenberger</span>, Kai~<span>Rocca</span>, Luis Aniello La<br><span>Resch</span>, Lukas~11~11~5~8~11~6~7~11~11~9|4~0~~HHHH00~<p><span>Magee</span>, Joshua</p>~<p><span>Richardson</span>, Asher</p>~11~11~11~~~8~3~6~~|5~0~~HGHHH0~<p><span>Svensson</span>, Elin</p>~<p><span>Pohl</span>, Hannah</p>~9~12~11~11~~11~10~7~9~|6~1~~HHHGH0~<span>Dörr</span>, Anika<br><span>Völker</span>, Jan-Colin~<span>Kaminski</span>, Lisa<br><span>Hess</span>, Daniel~11~11~10~11~~8~8~12~8~|7~2~~HHHH00~<p><span>Waldenberger</span>, Kai</p>~<p><span>Konder</span>, Lennart</p>~11~11~11~~~3~6~7~~|1506469532';

		assert.deepStrictEqual(btde._parse(str), {
			id: 'btde:TV Refrath 2-1.BC Beuel 2',
			team_names: ['TV Refrath 2', '1.BC Beuel 2'],
			mscore: [6, 1],
			scoring: '5x11_15^90',
			matches: [{
				name: 'HD1',
				players: [[
					{name: 'Jan-Colin Völker'},
					{name: 'Joshua Magee'},
				], [
					{name: 'Daniel Hess'},
					{name: 'Patrick Scheiel'},
				]],
				score: [[12, 10], [11, 9], [11, 7]],
			}, {
				name: 'DD',
				players: [[
					{name: 'Anika Dörr'},
					{name: 'Elin Svensson'},
				], [
					{name: 'Lisa Kaminski'},
					{name: 'Hannah Pohl'},
				]],
				score: [[7, 11], [5, 11], [6, 11]],
			}, {
				name: 'HD2',
				players: [[
					{name: 'Christoph Offermann'},
					{name: 'Kai Waldenberger'},
				], [
					{name: 'Luis Aniello La Rocca'},
					{name: 'Lukas Resch'},
				]],
				score: [[11, 6], [11, 7], [5, 11], [8, 11], [11, 9]],
			}, {
				name: 'HE1',
				players: [[
					{name: 'Joshua Magee'},
				], [
					{name: 'Asher Richardson'},
				]],
				score: [[11, 8], [11, 3], [11, 6]],
			}, {
				name: 'DE',
				players: [[
					{name: 'Elin Svensson'},
				], [
					{name: 'Hannah Pohl'},
				]],
				score: [[9, 11], [12, 10], [11, 7], [11, 9]],
			}, {
				name: 'GD',
				players: [[
					{name: 'Anika Dörr'},
					{name: 'Jan-Colin Völker'},
				], [
					{name: 'Lisa Kaminski'},
					{name: 'Daniel Hess'},
				]],
				score: [[11, 8], [11, 8], [10, 12], [11, 8]],
			}, {
				name: 'HE2',
				players: [[
					{name: 'Kai Waldenberger'},
				], [
					{name: 'Lennart Konder'},
				]],
				score: [[11, 3], [11, 6], [11, 7]],
			}],
		});
	});

	it('parse empty match', () => {
		const str = '0~0~0~TV Refrath~SC Union Lüdinghausen|1~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|2~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|3~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|4~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|5~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|6~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|7~0~~000000~<p>HEIM</p>~<p>GAST</p>~~~~~~~~~~|1506471257';

		assert.deepStrictEqual(btde._parse(str), {
			id: 'btde:TV Refrath-SC Union Lüdinghausen',
			team_names: ['TV Refrath', 'SC Union Lüdinghausen'],
			scoring: '5x11_15^90',
			mscore: [0, 0],
			matches: [{
				name: 'HD1',
				score: [],
			}, {
				name: 'DD',
				score: [],
			}, {
				name: 'HD2',
				score: [],
			}, {
				name: 'HE1',
				score: [],
			}, {
				name: 'DE',
				score: [],
			}, {
				name: 'GD',
				score: [],
			}, {
				name: 'HE2',
				score: [],
			}],
		});
	});
});
