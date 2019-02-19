var TestRequestResponse = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestRequestResponse.prototype = Object.create(TestBase.prototype);

TestRequestResponse.prototype.getScript = function() {
	return "05_requestResponse";
};

TestRequestResponse.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestRequestResponse");
  	console.log("##############################################");

	this.ctx = this.getTestContext(1, true, function() {
		this.ctx.sessions[0].session.sendRTData(422, GameSparksRT.deliveryIntent.UNRELIABLE, null);
		this.ctx.sessions[0].session.sendRTData(422, GameSparksRT.deliveryIntent.UNRELIABLE, null);

		var myThis = this;

		setTimeout(function() {
			myThis.ctx.stop();

			console.log("PASSED!");

			myThis.finished = true;
		}, 2000);
	});
};


