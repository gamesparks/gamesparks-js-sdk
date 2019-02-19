var CountdownLatch = function(initialCount) {
	this.startTime = 0;
	this.myTimer = null;
	this.timeout = 0
	this.callback = null;
	this.count = initialCount;
	this.complete = false;
};

CountdownLatch.prototype = {
	signal: function() {
		if (this.count > 0) {
			this.count = this.count - 1;

			if (this.count == 0) {
				this.complete = true;
			}
		}
	},

	isComplete: function() {
		return this.complete;
	},

	wait: function(timeout, callback) {
		this.timeout = timeout;
		this.callback = callback;

		this.startTime = Math.floor((new Date()).getTime() / 1000);

		this.myTimer = setInterval(this.timer.bind(this), 1000.0 / 60.0);
	},

	timer: function() {
		if (Math.floor((new Date()).getTime() / 1000) - this.startTime >= this.timeout && this.count > 0) {
			clearInterval(this.myTimer);
			this.myTimer = null;

			this.callback(true);
		} else if (this.count == 0) {
			clearInterval(this.myTimer);
			this.myTimer = null;

			this.callback(false);
		}
	}
};