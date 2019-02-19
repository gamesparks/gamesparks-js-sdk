var TestValidateRequestResponsePackets = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestValidateRequestResponsePackets.prototype = Object.create(TestBase.prototype);

TestValidateRequestResponsePackets.prototype.getScript = function() {
	return "07_ping_pong";
};

TestValidateRequestResponsePackets.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestValidateRequestResponsePackets");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(2, true, function() {
	  	var cdl = new CountdownLatch(250);

	  	var lastPacket1 = 1;
	  	var lastPacket2 = 0;

		this.ctx.sessions[0].onPacketCB = function(packet) {
			if (packet.opCode == 100) {
	      		var counter = packet.data.getLong(1);
	      
	      		console.log("a " + counter + "  " + lastPacket1);
	      		if (counter == lastPacket1 + 1) {
	        		cdl.signal();
	        		lastPacket1 = counter + 1;
	        		if (!cdl.isComplete()) {
	            		myThis.ctx.sessions[0].session.sendRTData(100, GameSparksRT.deliveryIntent.UNRELIABLE, RTData.get().setLong(1, lastPacket1));
	        		}
	      		}
	    	}
		};

		this.ctx.sessions[1].onPacketCB = function(packet) {
			if (packet.opCode == 100) {
				var counter = packet.data.getLong(1);

				console.log("b " + counter + "  " + lastPacket2);
				if (counter == lastPacket2 + 1) {
					cdl.signal();
					lastPacket2 = counter + 1;
					if (!cdl.isComplete()) {
						myThis.ctx.sessions[1].session.sendRTData(100, GameSparksRT.deliveryIntent.UNRELIABLE, RTData.get().setLong(1, lastPacket2));
					}
				}
			}
		};

		myThis.ctx.sessions[0].session.sendRTData(100, GameSparksRT.deliveryIntent.UNRELIABLE, RTData.get().setLong(1, 1));

		cdl.wait(40, function(timedout) {
			myThis.ctx.stop();

			assert(!timedout, "Didn't count down.");

			console.log("PASSED!");

			myThis.finished = true;
		});
	});
};