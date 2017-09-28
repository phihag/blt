'use strict';

var extradata = (function() {

var TEAM_COLORS = {
	'Beuel': '#ffed00',
	'Bischmisheim': '#1e3a8e',
	'BV Mülheim': '#ff423f',
	'BW Solingen': '#cbff81', // STC BW Solingen
	'Dortelweil': '#f9f152',
	'EBT Berlin': '#0d9aff',
	'Freystadt': '#ff161d',
	'Hohenlimburg': '#0ebbff',
	'Horner': '#ff2222', // Hamburg Horner TV
	'Lüdinghausen': '#ffffff',
	'Neuhausen': '#02c0ff',
	'Refrath': '#8bd6ff',
	'Trittau': '#ff557a',
	'Wipperfeld': '#ff2149',
	'Wittorf': '#0091ff',
};
var LOGOS = [
	'bcbeuel',
	'bcbsaarbruecken',
	'bcwipperfeld',
	'bvgifhorn',
	'ebtberlin',
	'sganspach',
	'sgschorndorf',
	'stcblauweisssolingen',
	'svfunballdortelweil',
	'tsvfreystadt',
	'tsvneubibergottobrunn',
	'tsvneuhausen',
	'tsvtrittau',
	'tuswiebelskirchen',
	'tvdillingen',
	'tvemsdetten',
	'tvrefrath',
	'unionluedinghausen',
	'vfbfriedrichshafen',
	'wittorfneumuenster',
];

function get_color(team_name) {
	for (var keyword in TEAM_COLORS) {
		if (team_name.includes(keyword)) {
			return TEAM_COLORS[keyword];
		}
	}
	return '#ddddff';
}

function team_logo(team_name) {
	var clean_name = team_name.toLowerCase().replace(/[^a-z]/g, '');
	if (LOGOS.includes(clean_name)) {
		return 'logos/' + clean_name + '.svg';
	}
}

return {
	get_color: get_color,
	team_logo: team_logo,
};

})();


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	module.exports = extradata;
}
/*/@DEV*/
