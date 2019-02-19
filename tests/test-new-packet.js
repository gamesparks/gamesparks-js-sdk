var TestNewPacket = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestNewPacket.prototype = Object.create(TestBase.prototype);

TestNewPacket.prototype.getScript = function() {
	return "03_newPacket";
};

TestNewPacket.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestNewPacket");
  	console.log("##############################################");

  	this.ctx = this.getTestContext(4, false);

  	var cdl = new CountdownLatch(6);
  
	this.ctx.sessions[0].onPacketCB = function(packet) {
		if (packet.opCode == 301) {
    		cdl.signal();
		} else {
      		throw new Error(packet.toString());
		}
	};

	this.ctx.sessions[1].onPacketCB = function(packet) {
		if (packet.opCode == 301) {
    		cdl.signal();
		} else {
      		throw new Error(packet.toString());
		}
	};

	this.ctx.sessions[2].onPacketCB = function(packet) {
		if (packet.opCode == 301) {
    		cdl.signal();
    	} else if (packet.opCode == 302 && packet.sender == 1) {
      		cdl.signal();
		} else {
      		throw new Error(packet.toString());
		}
	};

	this.ctx.sessions[3].onPacketCB = function(packet) {
		if (packet.opCode == 301) {
    		cdl.signal();
    	} else if (packet.opCode == 302 && packet.sender == 1) {
      		cdl.signal();
		} else {
      		throw new Error(packet.toString());
		}
	};

	this.ctx.sessions[0].start();
	this.ctx.sessions[1].start();
	this.ctx.sessions[2].start();
	this.ctx.sessions[3].start();

	var myThis = this;

	cdl.wait(15, function(timedout) {
		myThis.ctx.stop();

		assert(!timedout, "Messages not recieved.");

		console.log("PASSED!");

		myThis.finished = true;
	});
};


