var PlayerDisconnectMessage = function() {
	AbstractResult.call(this);

	this.peerId = 0;
  	this.activePeers = [];
};

PlayerDisconnectMessage.pool = new ObjectPool(function() {
	return new PlayerDisconnectMessage();
}, function(instance) {
  	instance.activePeers = [];
}, 5);

PlayerDisconnectMessage.prototype = Object.create(AbstractResult.prototype);

PlayerDisconnectMessage.prototype.execute = function() {
	this.session.activePeers = [];
  	this.session.activePeers = this.activePeers.slice();
  	this.session.log("PlayerDisconnectMessage", GameSparksRT.logLevel.DEBUG, "PeerId=" + this.peerId + ", ActivePeers " + this.session.activePeers.length);
  	this.session.onPlayerDisconnect(this.peerId);
  
  	PlayerDisconnectMessage.pool.push(this);
};

PlayerDisconnectMessage.deserialize = function(stream, instance) {
	if (instance.activePeers == null) {
		instance.activePeers = [];
	}

	while (true) {
		var keyByte = stream.readByte();

		if (keyByte == -1) {
			break;
		}

		var _continue = false;

		if (keyByte == 8) {
			instance.peerId = ProtocolParser.readUInt64(stream);

			_continue = true;
		} else if (keyByte == 32) {
			instance.activePeers.push(ProtocolParser.readUInt64(stream));

			_continue = true;
		}

		if (!_continue) {
			var key = ProtocolParser.readKey(keyByte, stream);

			if (key.field == 0) {
				console.log("WARNING: Invalid field id: 0, something went wrong in the stream");

				return null;
			} else {
				ProtocolParser.skipKey(stream, key);
			}
		}
	}

	return instance;
};
