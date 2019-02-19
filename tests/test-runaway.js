var TestRunaway = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestRunaway.prototype = Object.create(TestBase.prototype);

TestRunaway.prototype.getScript = function() {
	return "06_runaway";
};

TestRunaway.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestRunaway");
  	console.log("##############################################");

	this.ctx = this.getTestContext(1, true, function() {
		this.ctx.sessions[0].session.sendRTData(123, GameSparksRT.deliveryIntent.UNRELIABLE, null);
		
		var myThis = this;

		setTimeout(function() {
			myThis.ctx.stop();

			console.log("PASSED!");

			myThis.finished = true;
		}, 2000);
	});
};