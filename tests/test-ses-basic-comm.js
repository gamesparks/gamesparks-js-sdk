var TestSessionsDoBasicCommunication = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSessionsDoBasicCommunication.prototype = Object.create(TestBase.prototype);

TestSessionsDoBasicCommunication.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSessionsDoBasicCommunication");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(4, true, function() {
  		var cdl = new CountdownLatch(2);

		myThis.ctx.sessions[1].onPacketCB = function(packet) {
			if (packet.opCode == 123 && packet.sender == myThis.ctx.sessions[0].session.peerId) {
				cdl.signal();
			} else if (packet.opCode == 234 && packet.sender == myThis.ctx.sessions[0].session.peerId) {
				cdl.signal();
			} else {
				throw new Error("Unexpected Packet opCode:" + packet.opCode + " sender:" + packet.sender);
			}
		};

		myThis.ctx.sessions[0].session.sendData(123, GameSparksRT.deliveryIntent.RELIABLE, null, null, [myThis.ctx.sessions[1].session.peerId]);
		myThis.ctx.sessions[0].session.sendData(234, GameSparksRT.deliveryIntent.RELIABLE, null, null, [myThis.ctx.sessions[1].session.peerId]);

		cdl.wait(5, function(timedout) {
			myThis.ctx.stop();

			assert(!timedout, "Did not get message.");

			console.log("PASSED!");

			myThis.finished = true;
		});
  	});
};