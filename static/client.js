'use strict';

document.addEventListener('DOMContentLoaded', function() {
	var events = JSON.parse(uiu.qs('.events').getAttribute('data-initial-json'));
	crender.init(events);
	wsclient.init();
});


/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var crender = null;
	var uiu = null;
	var wsclient = null;
}
/*/@DEV*/
