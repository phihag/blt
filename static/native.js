'use strict';

document.addEventListener('DOMContentLoaded', function() {
	var events = JSON.parse(uiu.qs('.bbt_events').getAttribute('data-initial-json'));
	cvissel.init_ui();
	crender.init(events);
	wsclient.init();
});


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var crender = null;
	var cvissel = null;
	var uiu = null;
	var wsclient = null;
}
/*/@DEV*/
