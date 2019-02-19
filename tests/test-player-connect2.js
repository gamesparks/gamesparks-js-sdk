var TestPlayerConnect2 = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestPlayerConnect2.prototype = Object.create(TestBase.prototype);

TestPlayerConnect2.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestPlayerConnect2");
  	console.log("##############################################");

  	this.ctx = this.getTestContext(4, false);

  	var cdl = new CountdownLatch(3);
  
	this.ctx.sessions[0].start();

	var myThis = this;

	this.ctx.sessions[0].onPlayerConnectCB = function(peerId) {
		console.log("ctx.sessions[0].onPlayerConnectCB " + peerId);

		if (peerId == 2) {
			cdl.signal();
			myThis.ctx.sessions[1].stop();
		}
	};

	this.ctx.sessions[0].onPlayerDisconnectCB = function(peerId) {
		if (peerId == 2) {
			cdl.signal();
			myThis.ctx.sessions[1].start();
		}
	};

	this.ctx.sessions[0].onReadyCB = function(ready) {
		if (myThis.ctx.sessions[0].session.activePeers.length == 1 && myThis.ctx.sessions[0].session.activePeers[0] == 1) {
			myThis.ctx.sessions[1].start();
		}
	};

	cdl.wait(5, function(timedout) {
		myThis.ctx.stop();

		assert(!timedout, "Peer 2 did not connect.");

		console.log("PASSED!");

		myThis.finished = true;
	});
};


