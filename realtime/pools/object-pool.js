var ObjectPool = function(creator, refresher, maxSize) {
	this.stack = [];
	this.creator = creator;
	this.refresher = refresher;
	this.maxSize = maxSize;
};

ObjectPool.prototype = {
	pop: function() {
		if (this.stack.length == 0) {
			return this.creator();
		} else {
			return this.stack.shift();
		}
	},

	push: function(item) {
		if (item) {
			if (this.stack.indexOf(item) >= 0) {
		  		return;
			}
			if (this.stack.length < this.maxSize) {
		  		if (this.refresher) {
		    		this.refresher(item);
		  		}
		  		this.stack.push(item);
			}
		}
	},

	dispose: function() {
		this.stack = [];
	}
};