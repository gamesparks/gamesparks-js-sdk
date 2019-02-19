var TestRoundTripLatency = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestRoundTripLatency.prototype = Object.create(TestBase.prototype);

TestRoundTripLatency.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestRoundTripLatency");
  	console.log("##############################################");

  	var myThis = this;

  	var timerID = null;

  	this.ctx = this.getTestContext(2, true, function() {
  		var a = 10;
  		var b = 0;

  		myThis.ctx.sessions[1].onPacketCB = function(packet) {
			var currentEpoch = (new Date()).getTime();

			b = b + 1;

			console.log(b + " " + currentEpoch + " " + (currentEpoch - packet.data.getLong(1)));
			
			if (b >= 10) {
				myThis.ctx.stop();

				console.log("PASSED!");

				myThis.finished = true;
			}
		};

		timerID = setInterval(function() {
			if (a > 0) {
				myThis.ctx.sessions[0].session.sendRTData(2, GameSparksRT.deliveryIntent.UNRELIABLE, RTData.get().setLong(1, (new Date()).getTime()));
			} else {
				clearInterval(timerID);
			}
			a = a - 1;
		}, 0.03);
  	});
};


