var PlayerConnectMessage = function() {
	AbstractResult.call(this);

	this.peerId = 0;
  	this.activePeers = [];
};

PlayerConnectMessage.pool = new ObjectPool(function() {
	return new PlayerConnectMessage();
}, function(instance) {
  	instance.activePeers = [];
}, 5);

PlayerConnectMessage.prototype = Object.create(AbstractResult.prototype);

PlayerConnectMessage.prototype.execute = function() {
	this.session.activePeers = [];
  	this.session.activePeers = this.activePeers.slice();
  	this.session.log("PlayerConnectMessage", GameSparksRT.logLevel.DEBUG, "PeerId=" + this.peerId + ", ActivePeers " + this.session.activePeers.length);
  	this.session.onPlayerConnect(this.peerId);
  
  	PlayerConnectMessage.pool.push(this);
};

PlayerConnectMessage.deserialize = function(stream, instance) {
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