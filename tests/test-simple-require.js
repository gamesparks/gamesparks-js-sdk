var TestSimpleRequire = function() {
    TestBase.call(this);

    this.ctx = null;
};

TestSimpleRequire.prototype = Object.create(TestBase.prototype);

TestSimpleRequire.prototype.getScript = function() {
    return "10_simple_require";
};

TestSimpleRequire.prototype.start = function() {
    console.log("##############################################");
  	console.log("### TestSimpleRequire");
  	console.log("##############################################");

    var myThis = this;

  	this.ctx = this.getTestContext(1, false);

    var cdl = new CountdownLatch(1);

    this.ctx.sessions[0].onReadyCB = function(packet) {
        console.log("ctx.sessions[0].OnReadyCB");

        myThis.ctx.sessions[0].session.sendRTData(101, GameSparksRT.deliveryIntent.RELIABLE, null);
    };

    this.ctx.sessions[0].onPacketCB = function(packet) {
        if (packet.opCode == 102) {
            cdl.signal();
        }
    };

    this.ctx.sessions[0].start();

    cdl.wait(15, function(timedout) {
        myThis.ctx.stop();

        assert(!timedout, "Messages not recieved.");

        console.log("PASSED!\n")

        myThis.finished = true;
    });
};