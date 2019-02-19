var TestThirteenInts = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestThirteenInts.prototype = Object.create(TestBase.prototype);

TestThirteenInts.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestThirteenInts");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(2, true, function() {
  		myThis.ctx.sessions[1].onPacketCB = function(packet) {
			console.log(packet.toString());

			myThis.ctx.stop();

			console.log("PASSED!");

			myThis.finished = true;
		}

		var data = RTData.get();

		data.setString(1, "USER NAME");
		data.setLong(2, 1);
		data.setString(3, "TEAM NAME");

		var numIntsToSend = 13;
		var index = 4;

		data.setLong(index, numIntsToSend);
		index = index + 1;

		for (var i = 1; i <= numIntsToSend; i ++) {
			data.setLong(index, 0);
			index = index + 1;
		}

		myThis.ctx.sessions[0].session.sendRTData(120, GameSparksRT.deliveryIntent.RELIABLE, data);
  	});
};


