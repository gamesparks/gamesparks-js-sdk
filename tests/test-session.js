var TestSession = function(connectToken, host, port, name) {
	this.name = name;
	this.onPlayerConnectCB = null;
	this.onPlayerDisconnectCB = null;
	this.onReadyCB = null;
	this.onPacketCB = null;

	var index = host.indexOf(":");
	var theHost;

	if (index > 0) {
		theHost = host.slice(0, index);
	} else {
		theHost = host;
	}

	console.log(theHost + " : " + port);

	this.session = GameSparksRT.getSession(connectToken, theHost, port, this);
};

TestSession.prototype = {
	start: function() {
  		if (this.session != null) {
    		this.session.start();
  		}
	},

	stop: function() {
  		if (this.session != null) {
    		this.session.stop();
  		}
	},

	log: function(message) {
		var peers = "|";

		for (var k in this.session.activePeers) { 
			peers = peers + this.session.activePeers[k] + "|";
		}

		console.log(this.session.peerId + ":" + this.name + " " + message + " peers:" + peers);
	},

	onPlayerConnect: function(peerId) {
		this.log(" OnPlayerConnect:" + peerId);

		if (this.onPlayerConnectCB != null) {
			this.onPlayerConnectCB(peerId);
		}
	},

	onPlayerDisconnect: function(peerId) {
		this.log(" OnPlayerDisconnect:" + peerId);

		if (this.onPlayerDisconnectCB != null) {
			this.onPlayerDisconnectCB(peerId);
		}
	},

	onReady: function(ready) {
		this.log(" OnReady:" + ready.toString());

		if (this.onReadyCB != null) {
			this.onReadyCB(ready);
		}
	},

	onPacket: function(packet) {
		this.log(" OnPacket:" + packet.toString());

		if (this.onPacketCB != null) {
			this.onPacketCB(packet);
		}
	}
};
