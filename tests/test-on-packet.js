var TestOnPacket = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestOnPacket.prototype = Object.create(TestBase.prototype);

TestOnPacket.prototype.getScript = function() {
	return "04_onPacket";
};

TestOnPacket.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestOnPacket");
  	console.log("##############################################");

  	var myThis = this;

    var cdl = new CountdownLatch(5);

  	this.ctx = this.getTestContext(2, true, function() {
  		myThis.ctx.sessions[0].onPacketCB = function(packet) {
      		if (packet.opCode == 402) {
        		cdl.signal();
      		} else if (packet.opCode == 1402) {
        		cdl.signal();
      		} else {
        		throw new Error(packet.toString());
      		}
    	};
  
    	myThis.ctx.sessions[1].onPacketCB = function(packet) {
    		  if (packet.opCode == 1401) {
        		cdl.signal();
    
        		var myVec = new RTVector(1.0, 2.0, 3.0);
    
        		myThis.ctx.sessions[1].session.sendRTData(402, 
          			GameSparksRT.deliveryIntent.UNRELIABLE, 
          			RTData.get()
            		.setData(2, RTData.get().setLong(1, 1))
            		.setDouble(1, 1.2345)
            		.setFloat(3, 1.23)
            		.setRTVector(4, myVec)
            		.setLong(6, 1234)
            		.setString(5, "gabs"));
      		} else if (packet.opCode == 1402) {
        		var d = packet.data;
    
        		if (d.getData(12).getLong(1) == 1 &&
          			TestUtils.round(d.getDouble(11), 4) == 1.2345 &&
          			TestUtils.round(d.getFloat(13), 2) == 1.23 &&
          			TestUtils.round(d.getRTVector(14).x, 1) == 1.0 &&
          			TestUtils.round(d.getRTVector(14).y, 1) == 2.0 &&
          			TestUtils.round(d.getRTVector(14).z, 1) == 3.0 &&
          			d.getLong(16) == 1234 &&
          			d.getString(15) === "gabs") {
          			cdl.signal();
        		} else {
          			throw new Error(packet.toString());
        		}
      		} else if (packet.opCode == 1414) {
        		if (packet.data.getString(1).slice(0, 1) === "{") {
          			cdl.signal();
        		}
      		} else {
        		throw new Error(packet.toString());
      		}
    	};
    
    	myThis.ctx.sessions[1].session.sendRTData(401, GameSparksRT.deliveryIntent.UNRELIABLE, null, [1]);
    	myThis.ctx.sessions[1].session.sendRTData(413, GameSparksRT.deliveryIntent.UNRELIABLE, null, [1]);
    	myThis.ctx.sessions[1].session.sendRTData(414, GameSparksRT.deliveryIntent.UNRELIABLE, null, [1]);
    	myThis.ctx.sessions[1].session.sendRTData(412, 
      		GameSparksRT.deliveryIntent.UNRELIABLE, 
      		RTData.get().setData(1, RTData.get().setData(1, RTData.get().setDouble(1, 1234.123))),
      		[1]);
    
    	cdl.wait(5, function(timedout) {
      		console.log("Stopped");
      
      		myThis.ctx.stop();
    
      		assert(!timedout, "Didn't count down.");
      
      		console.log("PASSED!");
      
      		myThis.finished = true
    	});
  	});
};