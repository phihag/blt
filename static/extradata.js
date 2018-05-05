'use strict';

var extradata = (function() {

var TEAM_COLORS = {
	'Beuel': '#ffed00',
	'Bischmisheim': '#8bd6ff',
	'BV Mülheim': '#ff423f',
	'BW Solingen': '#cbff81', // STC BW Solingen
	'Dortelweil': '#f9f152',
	'EBT Berlin': '#0d9aff',
	'Freystadt': '#ff161d',
	'Hohenlimburg': '#0ebbff',
	'Horner': '#ff2222', // Hamburg Horner TV
	'Lüdinghausen': '#ff1400',
	'Neuhausen': '#02c0ff',
	'Refrath': '#1e3a8e',
	'Trittau': '#ff557a',
	'Wipperfeld': '#ff2149',
	'Wittorf': '#0091ff',
};
function get_color(team_name) {
	for (var keyword in TEAM_COLORS) {
		if (team_name.includes(keyword)) {
			return TEAM_COLORS[keyword];
		}
	}
	return '#ddddff';
}

var LOGOS = [
	'bcbeuel',
	'bcbsaarbruecken',
	'bchohenlimburg',
	'bcwipperfeld',
	'bspfrneusatz',
	'bvgifhorn',
	'bvmuelheim',
	'ebtberlin',
	'hamburghornertv',
	'sganspach',
	'sgebtberlin',
	'sgschorndorf',
	'stcblauweisssolingen',
	'svfischbach',
	'svfunballdortelweil',
	'svgutsmuthsjena',
	'tsvfreystadt',
	'tsvneubibergottobrunn',
	'tsvneuhausen',
	'tsvtrittau',
	'tuswiebelskirchen',
	'tvdillingen',
	'tvemsdetten',
	'tvmarktheidenfeld',
	'tvrefrath',
	'unionluedinghausen',
	'vfbfriedrichshafen',
	'vfbscpeine',
	'wittorfneumuenster',
];
var LOGO_ALIASSE = {
	'1.BC Sbr.-Bischmisheim': 'bcbsaarbruecken',
	'1.BV Mülheim': 'bvmuelheim',
	'BC Bischmisheim': 'bcbsaarbruecken',
	'Blau-Weiss Wittorf-NMS': 'wittorfneumuenster',
	'SC Union Lüdinghausen': 'unionluedinghausen',
	'TSV Neuhausen-Nymphenburg': 'tsvneuhausen',
};
function team_logo(team_name) {
	team_name = LOGO_ALIASSE[team2club(team_name)] || team_name;

	var clean_name = team_name.toLowerCase().replace(/[^a-z]/g, '');
	if (LOGOS.includes(clean_name)) {
		return 'logos/' + clean_name + '.svg';
	}
}

function team2club(team_name) {
	return team_name.replace(/[\s0-9]+$/, '');
}

var NRW2016_RE = /^NRW-(O19)-(?:(?:([NS])([12]))-)?([A-Z]{2})-([0-9]{3})-(?:2016|2017)$/;
function name_by_league(league_key) {
	if (/^1BL-(?:2015|2016|2017)$/.test(league_key)) {
		return '1. Bundesliga';
	}
	if (/^2BLN-(?:2015|2016|2017)$/.test(league_key)) {
		return '2. Bundesliga Nord';
	}
	if (/^2BLS-(?:2015|2016|2017)$/.test(league_key)) {
		return '2. Bundesliga Süd';
	}
	if (league_key === 'OBL-2017') {
		return 'ÖBV-Bundesliga'; // Österreich
	}
	if (league_key === 'RLN-2016') {
		return 'Regionalliga Nord';
	}
	if (league_key === 'RLM-2016') {
		return 'Regionalliga Mitte';
	}
	if (league_key === 'NLA-2017') {
		return 'NLA';
	}
	if (league_key === 'RLW-2016') {
		league_key = 'NRW-O19-RL-001-2016';
	}

	var m = NRW2016_RE.exec(league_key);
	if (m) {
		var league_name = {
			'RL': 'Regionalliga',
			'OL': 'NRW-Oberliga',
			'VL': 'Verbandsliga',
			'LL': 'Landesliga',
			'BL': 'Bezirksliga',
			'BK': 'Bezirksklasse',
			'KL': 'Kreisliga',
			'KK': 'Kreisklasse',
		}[m[4]];

		var location_name;
		if (m[4] === 'RL') {
			location_name = 'West';
		} else if (m[4] === 'OL') {
			location_name = (m[5] === '002') ? 'Nord' : 'Süd';
		} else {
			location_name = {
				'N': 'Nord',
				'S': 'Süd',
			}[m[2]];
			if (location_name) {
				location_name += ' ' + m[3];
			} else {
				location_name = m[2] + ' ' + m[3];
			}
		}

		if (!league_name) {
			return league_key;
		}

		return league_name + ' ' + location_name + ' (' + m[5] + ')';
	}

	return league_key;
}

var SHORT_NAMES = {
	'TSV Neuhausen-Nymphenburg': 'Neuhausen',
	'Hamburg Horner TV': 'HornerTV',
	'SV GutsMuths Jena': 'Jena',
};
function shortname(team_name) {
	if (SHORT_NAMES[team_name]) {
		return SHORT_NAMES[team_name];
	}
	var num_m = /\s([JSM]?(?:[2-9]|[1-3][0-9]))$/.exec(team_name);
	var parts = team_name.split(/[\s-/]+/);
	var res = parts[0];
	parts.forEach(function(p) {
		if (p.length > res.length) {
			res = p;
		}
	});
	if (num_m) {
		res += num_m[1];
	}
	return res;
}

return {
	shortname: shortname,
	get_color: get_color,
	team_logo: team_logo,
	name_by_league: name_by_league,
};

})();


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	module.exports = extradata;
}
/*/@DEV*/
