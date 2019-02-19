var TestBase = function() {
	this.finished = false;
	this.autoStartCB = null;
};

TestBase.prototype = {
	getScript: function() {
		return null;
	},

	getVersion: function() {
		return TestConfig.version;
	},

	getRTData: function(depth) {
		var data;

		if (depth == null) {
			depth = 1;
		} else if (depth == 3) {
			return null;
		}

		data = RTData.get();
		data.setDouble(1, 20.20);
		data.setFloat(2, 30.30);
		data.setLong(3, depth * 10);
		data.setLong(4, -40);
		data.setRTVector(5, new RTVector(1.1, 2.2, 3.3));
		data.setString(6, "thisisastring" + depth.toString());
		data.setData(7, this.getRTData(depth + 1));

		return data;
	},

	getContext: function(qty) {
		if (this.getVersion() > 0) {
			return new TestContext(qty, TestConfig.apiKey, TestConfig.secret, TestConfig.rtServer, TestConfig.port, TestConfig.cluster, this.getScript(), this.getVersion());
		} else {
			return new TestContext(qty, TestConfig.apiKey, TestConfig.secret, TestConfig.rtServer, TestConfig.port, TestConfig.cluster, this.getScript(), 0);
		}
	},

	getTestContext: function(qty, autoStart, autoStartCB) {
		var ctx = this.getContext(qty);

		ctx.start();

		var cdl = new CountdownLatch(ctx.sessions.length);

		for (var i = 0; i < ctx.sessions.length; i ++) {
			ctx.sessions[i].onPacketCB = function(packet) {
				console.log(packet);

				throw new Error("Unexpected Packet on wrong session " + ctx.sessions[i].session.peerId);
			};
		}

		for (var i = 0; i < ctx.sessions.length; i ++) {
			ctx.sessions[i].onReadyCB = function(ready) {
				if (ready) {
					cdl.signal();
				}
			};
		}

		if (autoStart) {
			for (var i = 0; i < ctx.sessions.length; i ++) {
				ctx.sessions[i].start();
			}

			this.autoStartCB = autoStartCB;

			var myThis = this;

			cdl.wait(5, function(timedout) {
				if (timedout) {
					for (var i = 0; i < ctx.sessions.length; i ++) {
						ctx.sessions[i].stop();
					}

					throw new Error("Did not become ready");
				}
				
				if (myThis.autoStartCB != null) {
					myThis.autoStartCB();
				}
			});
		}

		return ctx;
	}
};
