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

/*@DEV*/
if ((typeof module !== 'undefined') && (typeof require !== 'undefined')) {
	var uiu = null;
}
/*/@DEV*/
