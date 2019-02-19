var TestSendPayload = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSendPayload.prototype = Object.create(TestBase.prototype);

TestSendPayload.arrayFromString = function(str) {
	var bytes = [];
	
	for (var i = 0; i < str.length; i ++) {
    	bytes.push(str.charCodeAt(i) & 0xFF);
	}

	return bytes;
};

TestSendPayload.stringFromArray = function(arr) {
	var str = "";
	
	for (var i = 0; i < arr.length; i ++) {
    	str = str + String.fromCharCode(arr[i]);
	}

	return str;
};

TestSendPayload.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSendPayload");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(2, true, function() {
  		var cdl = new CountdownLatch(2);

  		myThis.ctx.sessions[1].onPacketCB = function(packet) {
			if (packet.opCode == 222) {
				var b = [];
				var ret;

				ret = packet.stream.read(b, 0, packet.streamLength);
				b = ret[1];

				if (TestSendPayload.stringFromArray(b) === myThis.ctx.sessionId) {
					cdl.signal();
				}
			} else {
				throw new Error("Unexpected Packet");
			}
		};

		myThis.ctx.sessions[0].session.sendData(222,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			TestSendPayload.arrayFromString(myThis.ctx.sessionId),
			null,
			[myThis.ctx.sessions[1].session.peerId]);

		myThis.ctx.sessions[0].session.sendBytes(222,  
			GameSparksRT.deliveryIntent.RELIABLE, 
			TestSendPayload.arrayFromString(myThis.ctx.sessionId),
			[myThis.ctx.sessions[1].session.peerId]);

		cdl.wait(5, function(timedout) {
			myThis.ctx.stop();

			assert(!timedout, "Did not get message.");

			console.log("PASSED!");

			myThis.finished = true;
		});
  	});
};