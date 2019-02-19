var TestSessionsDontBecomeReadyIfNotStarted = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSessionsDontBecomeReadyIfNotStarted.prototype = Object.create(TestBase.prototype);

TestSessionsDontBecomeReadyIfNotStarted.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSessionsDontBecomeReadyIfNotStarted");
  	console.log("##############################################");

  	this.ctx = this.getTestContext(4, false);

  	var cdl = new CountdownLatch(3);
  
	for (var i = 0; i < 4; i ++) {
		this.ctx.sessions[i].onReadyCB = function(ready) {
			if (ready) {
				cdl.signal();
			}
		};
	}

	var myThis = this;

	cdl.wait(5, function(timedout) {
		assert(timedout, "Did became ready.");

		console.log("PASSED!");

		myThis.finished = true;
	});
};