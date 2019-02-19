var TestPlayerConnect = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestPlayerConnect.prototype = Object.create(TestBase.prototype);

TestPlayerConnect.prototype.getScript = function() {
	return "01_playerConnect";
};

TestPlayerConnect.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestPlayerConnect");
  	console.log("##############################################");

  	this.ctx = this.getTestContext(2, false);

  	var cdl = new CountdownLatch(3);
  
	var session0Responses = ["Player gsplayerid1 connected.", "Player gsplayerid2 connected."];
	var session1Responses = ["Player gsplayerid1 connected.", "Player gsplayerid2 connected."];

	this.ctx.sessions[0].onPacketCB = function(packet) {
		if (packet.opCode == 123) {
			if (!TestUtils.contains(session0Responses, packet.data.getString(1))) {
				throw new Error("NOT EXPECTED " + packet.data.getString(1));
			}
			TestUtils.remove(session0Responses, packet.data.getString(1));
			cdl.signal();   
		}
	};

	this.ctx.sessions[1].onPacketCB = function(packet) {
		if (packet.opCode == 123) {
			if (!TestUtils.contains(session1Responses, packet.data.getString(1))) {
				throw new Error("NOT EXPECTED " + packet.data.getString(1));
			}
			TestUtils.remove(session1Responses, packet.data.getString(1));
			cdl.signal();
		}
	};

	this.ctx.sessions[0].start();
	this.ctx.sessions[1].start();

	var myThis = this;

	cdl.wait(10, function(timedout) {
		myThis.ctx.stop();

		assert(!timedout, "Messages not recieved.");

		console.log("PASSED!");

		myThis.finished = true;
	});
};


