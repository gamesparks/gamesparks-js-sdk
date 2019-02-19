var UDPConnectMessage = function() {
	AbstractResult.call(this);
};

UDPConnectMessage.pool = new ObjectPool(function() {
	return new UDPConnectMessage();
}, null, 5);

UDPConnectMessage.prototype = Object.create(AbstractResult.prototype);

UDPConnectMessage.prototype.execute = function() {
	var reliable;

	if (this.packet.reliable != null) {
		reliable = this.packet.reliable;
	} else {
		reliable = false;
	}

	this.session.log("UDPConnectMessage", GameSparksRT.logLevel.DEBUG, "(UDP) reliable=" + reliable.toString() + ", ActivePeers " + this.session.activePeers.length);

	if (!reliable) { 
		self.session.setConnectState(GameSparksRT.connectState.RELIABLE_AND_FAST);
		self.session.sendData(-5, GameSparksRT.deliveryIntent.RELIABLE, null, null);
	} else {
		self.session.log("UDPConnectMessage", GameSparksRT.logLevel.DEBUG, "TCP (Unexpected) UDPConnectMessage");
	}

	UDPConnectMessage.pool.push(this);
};

UDPConnectMessage.prototype.executeAsync = function() {
  	return false;
};

UDPConnectMessage.deserialize = function(stream, instance) {
	while (true) {
		var keyByte = stream.readByte();

		if (keyByte == -1) {
			break;
		}

		var key = ProtocolParser.readKey(keyByte, stream);

		if (key.field == 0) {
			console.log("WARNING: Invalid field id: 0, something went wrong in the stream");

			return null;
		} else {
			ProtocolParser.skipKey(stream, key);
		}
	}

	return instance;
};