var TestSendRTDataAndGetAJSIntAndFloatArray = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSendRTDataAndGetAJSIntAndFloatArray.prototype = Object.create(TestBase.prototype);

TestSendRTDataAndGetAJSIntAndFloatArray.prototype.getScript = function() {
	return "08_test_unit";
};

TestSendRTDataAndGetAJSIntAndFloatArray.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSendRTDataAndGetAJSIntAndFloatArray");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(2, true, function() {
  		var cdl = new CountdownLatch(1);

		myThis.ctx.sessions[0].onPacketCB = function(packet) {
			if (packet.opCode == 445) {
				var vec = packet.data.getRTVector(2);

				if (vec.x != 1.0) {
					throw new Error("vec.x " + vec.x);
				}

				if (vec.y != 2.0) {
					throw new Error("vec.y " + vec.y);
				}

				if (packet.data.getLong(1) != 2) {
					throw new Error("GetLong(1) " + packet.data.getLong(1));
				}

				cdl.signal();
			} else {
				throw new Error("Unexpected Packet");
			}
		};

		myThis.ctx.sessions[0].session.sendData(444,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			null, 
			null, 
			[myThis.ctx.sessions[1].session.peerId]);

		cdl.wait(5, function(timedout) {
			myThis.ctx.stop();

			assert(!timedout, "Did not get message.");

			console.log("PASSED!");

			myThis.finished = true;
		});
  	});
};