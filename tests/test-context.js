var TestContext = function(qty, apiKey, secret, rtServer, port, cluster, script, version) {
	this.running = false;
	this.myTimer = null;
  	this.sessionId = TestUtils.generateGUID();
  	this.sessions = TestUtils.getSessions(qty, apiKey, secret, rtServer, port, cluster, script, version);
};

TestContext.prototype = {
	start: function() {
		this.running = true;

		if (this.myTimer == null) {
			this.myTimer = setInterval(this.enterFrame.bind(this), 1000.0 / 60.0);
		}
	},

	stop: function() {
		this.running = false;
		
		if (this.myTimer != null) {
			clearInterval(this.myTimer);
			this.myTimer = null;
		}

		for (var i = 0; i < this.sessions.length; i ++) {
			this.sessions[i].session.stop();
		}
	},

	enterFrame: function() {
		for (var i = 0; i < this.sessions.length; i ++) {
			this.sessions[i].session.update();
		}
	}
};