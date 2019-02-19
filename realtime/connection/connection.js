var Connection = function(session) {
	this.session = session;
	this.stopped = false;
};

Connection.prototype = {
	stop: function() {
		this.stopped = true;
  		this.stopInternal();
  	},

  	onPacketReceived: function(p, packetSize) {
		if (p.command) {
			if (p.command["abstractResultType"]) {
				var result = p.command;

				result.configure(p, this.session);
				if (result.executeAsync()) {
					this.session.submitAction(p.command);
				} else {
					p.command.execute();
				}
			} else {
				this.session.submitAction(p.command);
			}
		} else {
			if (!p.hasPayload) {
				var cmd;

				if (p.sender) {
					cmd = CustomCommand.pool.pop().configure(p.opCode, p.sender, null, p.data, 0, this.session, packetSize);
				} else {
					cmd = CustomCommand.pool.pop().configure(p.opCode, 0, null, p.data, 0, this.session, packetSize);
				}

				if (cmd) {
					this.session.submitAction(cmd);
				}
			}
		}
	}
};