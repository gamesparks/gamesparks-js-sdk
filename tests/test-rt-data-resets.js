var TestRTDataResets = function() {
	TestBase.call(this);

	this.ctx = null;
};

TestRTDataResets.prototype = Object.create(TestBase.prototype);

TestRTDataResets.prototype.start = function() {
	console.log("##############################################");
  	console.log("### TestRTDataResets");
  	console.log("##############################################");

  	var d = RTData.get();
  
	d.setLong(1, 1);
	d.setString(2, "asdf");

	console.log("d(1)=" + d.getLong(1));

	d.dispose();

	console.log("d(1)=" + d.getLong(1));

	assert(d.getLong(1) == null);

	console.log("PASSED!");

	this.finished = true;
};