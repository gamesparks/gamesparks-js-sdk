var TestSessionsBecomeReadyIfStarted = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestSessionsBecomeReadyIfStarted.prototype = Object.create(TestBase.prototype);

TestSessionsBecomeReadyIfStarted.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestSessionsBecomeReadyIfStarted");
  	console.log("##############################################");

  	var myThis = this;

  	this.ctx = this.getTestContext(4, true, function() {
		myThis.ctx.stop();

		console.log("PASSED!");

		myThis.finished = true;
  	});
};