var TestSetData = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSetData.prototype = Object.create(TestBase.prototype);

TestSetData.prototype.getScript = function() {
	return "02_setData";
};

TestSetData.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSetData");
  	console.log("##############################################");

	this.ctx = this.getTestContext(1, false);

  	var cdl = new CountdownLatch(7);
  
  	this.ctx.sessions[0].onPacketCB = function(packet) {
		if (packet.opCode == 202) {
			if (TestUtils.round(packet.data.getDouble(1), 5) == 2.48771) {
				cdl.signal();  
			} else {
				throw new Error("");
			}
		} else if (packet.opCode == 203) {
			if (TestUtils.round(packet.data.getFloat(1), 4) == 1.5705) {
				cdl.signal();  
			} else {
				throw new Error("");
			}
		} else if (packet.opCode == 204) {
			var v = packet.data.getRTVector(1);

			if (TestUtils.round(v.x, 3) == 1.123 && TestUtils.round(v.y, 3) == 2.234 && TestUtils.round(v.z, 3) == 3.345) {
				cdl.signal();
			} else {
				throw new Error("");
			}
		} else if (packet.opCode == 205) {
			if (packet.data.getLong(1) == -1 && packet.data.getLong(2) == 96 && packet.data.getLong(3) == -96 &&
				packet.data.getLong(4) == 0 && packet.data.getLong(5) == 1) {
				cdl.signal();
			} else {
				throw new Error("");
			}
		} else if (packet.opCode == 207) {
			if (packet.data.getString(1) == "This is the THIRD line.") {
				cdl.signal();
			} else {
				throw new Error("");
			}
		} else if (packet.opCode == 208) {
			if (packet.data.getData(1).getString(2) == "!@£$%^&*()-=_+[]{};':|,./<>/?§±`~") {
				cdl.signal(); 
			} else {
				throw new Error("");
			}
		} else if (packet.opCode == 209) {
			if (packet.data.getString(1) == "??????????") {
				cdl.signal();  
			}
		}
	};

	this.ctx.sessions[0].start();

	var myThis = this;

	cdl.wait(10, function(timedout) {
		myThis.ctx.stop();

		assert(!timedout, "Messages not recieved.");

		console.log("PASSED!");

		myThis.finished = true;
	});
};


