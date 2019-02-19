var TestSendRTData = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSendRTData.prototype = Object.create(TestBase.prototype);

TestSendRTData.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSendRTData");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(2, true, function() {
  		var cdl = new CountdownLatch(3);

		myThis.ctx.sessions[1].onPacketCB = function(packet) {
			if (packet.opCode == 333) {
				//if packet.stream == nil and packet.data:toString() == TestsSendRTData.testBase:getRTData():toString() then
				if (packet.stream == null) {
					cdl.signal();
				}
			} else {
				throw new Error("Unexpected Packet");
			}
		};

		myThis.ctx.sessions[0].session.sendData(333,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			null, 
			myThis.getRTData(), 
			[myThis.ctx.sessions[1].session.peerId]);

		myThis.ctx.sessions[0].session.sendRTData(333,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			myThis.getRTData(), 
			[myThis.ctx.sessions[1].session.peerId]);

		myThis.ctx.sessions[0].session.sendRTDataAndBytes(333,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			null, 
			myThis.getRTData(), 
			[myThis.ctx.sessions[1].session.peerId]);

		cdl.wait(5, function(timedout) {
			myThis.ctx.stop();

			assert(!timedout, "Did not get message.");

			console.log("PASSED!");

			myThis.finished = true;
		});
  	});
};