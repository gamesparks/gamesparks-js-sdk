var TestJavaScriptExtractCorrectDataFromRTDataObject = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestJavaScriptExtractCorrectDataFromRTDataObject.prototype = Object.create(TestBase.prototype);

TestJavaScriptExtractCorrectDataFromRTDataObject.prototype.getScript = function() {
	return "08_test_unit";
};

TestJavaScriptExtractCorrectDataFromRTDataObject.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestJavaScriptExtractCorrectDataFromRTDataObject");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(2, true, function() {
  		var cdl = new CountdownLatch(6);

		myThis.ctx.sessions[0].onPacketCB = function(packet) {
			if (packet.opCode == 555) {
				if (TestUtils.round(packet.data.getFloat(1), 1) != 30.3) {
					throw new Error("packet.GetFloat (1) " + packet.data.getFloat(1));
				}
				cdl.signal();
			} else if (packet.opCode == 556) {
				if (packet.data.getLong(1) != 10) {
					throw new Error("packet.GetLong (1) " + packet.data.getLong(1));
				}
				cdl.signal();
			} else if (packet.opCode == 557) {
				if (packet.data.getLong(1) != -40) {
					throw new Error("packet.GetLong (1) " + packet.data.getLong(1));
				}
				cdl.signal();
			} else if (packet.opCode == 558) {
				if (TestUtils.round(packet.data.getRTVector(1).x, 1) != 1.1 ||
					TestUtils.round(packet.data.getRTVector(1).y, 1) != 2.2 ||
					TestUtils.round(packet.data.getRTVector(1).z, 1) != 3.3) {
					throw new Error("packet.GetRTVector (1) " + packet.data.getRTVector(1));
				}
				cdl.signal();
			} else if (packet.opCode == 559) {
				if (TestUtils.round(packet.data.getDouble(1), 2) != 20.20) {
					throw new Error("packet.GetDouble (1) " + packet.data.getDouble(1));
				}
				cdl.signal();
			} else if (packet.opCode == 560) {
				if (packet.data.getData(1).getLong(3) != 20) {
					throw new Error("packet.GetData (1) " + packet.data.getData(1).getLong(3));
				}
				cdl.signal();
			} else {
				throw new Error("Unexpected OpCode " + packet.opCode);
			}
		};

		myThis.ctx.sessions[0].session.sendRTData(554,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			myThis.getRTData(), 
			[myThis.ctx.sessions[1].session.peerId]);

		cdl.wait(10, function(timedout) {
			myThis.ctx.stop();

			assert(!timedout, "Did not get message.");

			console.log("PASSED!");

			myThis.finished = true;
		});
  	});
};