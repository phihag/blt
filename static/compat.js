'use strict';

if (! Array.prototype.includes) {
	Array.prototype.includes = function(el) {
		for (var i = 0;i < this.length;i++) {
			if (this[i] === el) return true;
		}
		return false;
	};
}

if (! String.prototype.includes) {
	String.prototype.includes = function(substr) {
		return this.indexOf(substr) !== -1;
	};
}

window.addEventListener('load', function() {
	var test = document.createElement('div');
	test.style.cssText = 'position:sticky';
	if (! test.style.position) {
		var height = uiu.qs('.shortcuts').scrollHeight;
		uiu.qs('.bbt_h1').style.marginTop = height + 'px';
	}
});

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var uiu = null;
}
/*/@DEV*/
