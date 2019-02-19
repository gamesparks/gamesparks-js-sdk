var LoginResult = function() {
	AbstractResult.call(this);

	this.success = false;
  	this.reconnectToken = null;
  	this.peerId = null;
  	this.activePeers = [];
  	this.fastPort = null;
};

LoginResult.pool = new ObjectPool(function() {
	return new LoginResult();
}, function(instance) {
  	instance.activePeers = [];
  	instance.fastPort = null;
  	instance.reconnectToken = null;
  	instance.peerId = null;
}, 5);

LoginResult.prototype = Object.create(AbstractResult.prototype);

LoginResult.prototype.execute = function() {
	this.session.connectToken = this.reconnectToken;
	this.session.peerId = this.peerId;

	if (this.packet.reliable == null || this.packet.reliable == true) {
		if (this.fastPort != null && this.fastPort) {
			this.session.fastPort = this.fastPort;
		}

		//this.session.activePeers = [];
		this.session.activePeers = this.activePeers.slice();

		this.session.setConnectState(GameSparksRT.connectState.RELIABLE_ONLY);
		this.session.connectFast();
		//this.session.log("LoginResult", GameSparksRT.logLevel.DEBUG, this.session.peerId + " TCP LoginResult, ActivePeers " + this.session.activePeers.length + " FastPort " + this.session.fastPort);
		this.session.log("LoginResult", GameSparksRT.logLevel.DEBUG, this.session.peerId + " TCP LoginResult, ActivePeers " + this.session.activePeers.length);
	} else {
		this.session.setConnectState(GameSparksRT.connectState.RELIABLE_AND_FAST_SEND);
		//this.session.log("LoginResult", GameSparksRT.logLevel.DEBUG, this.session.peerId + " UDP LoginResult, ActivePeers " + this.session.activePeers.length);
	}

	LoginResult.pool.push(this);
};

LoginResult.prototype.executeAsync = function() {
  	return false;
};

LoginResult.deserialize = function(stream, instance) {
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
			instance.success = ProtocolParser.readBool(stream);
			
			_continue = true;
		} else if (keyByte == 18) {
			instance.reconnectToken = ProtocolParser.readString(stream);
			
			_continue = true;
		} else if (keyByte == 24) {
			instance.peerId = ProtocolParser.readUInt64(stream);
			
			_continue = true;
		} else if (keyByte == 32) {
			instance.activePeers.push(ProtocolParser.readUInt64(stream));
			
			_continue = true;
		} else if (keyByte == 40) {
			instance.fastPort = ProtocolParser.readUInt64(stream);
			
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
