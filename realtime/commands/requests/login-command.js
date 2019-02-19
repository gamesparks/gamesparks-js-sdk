var LoginCommand = function(token) {
	RTRequest.call(this);

  	this.opCode = 0;
  	this.token = token;
  	this.clientVersion = 2;
};

LoginCommand.prototype = Object.create(RTRequest.prototype);

LoginCommand.prototype.toPacket = function(session, fast) {
	var p = PooledObjects.packetPool.pop();

	p.opCode = this.opCode;
	p.data = this.data;
	p.session = session;

	if (!fast && this.intent != GameSparksRT.deliveryIntent.RELIABLE) {
		p.reliable = false;
	}

	if (this.intent == GameSparksRT.deliveryIntent.UNRELIABLE_SEQUENCED) {
		p.sequenceNumber = session.nextSequenceNumber();
	}

	if (this.targetPlayers.length > 0) {
		p.targetPlayers = this.targetPlayers;
	}

	p.request = this;

	return p;
};

LoginCommand.prototype.serialize = function(stream) {
	if (this.token != null) {
		stream.writeByte(10);
		ProtocolParser.writeString(stream, this.token);
	}
	if (this.clientVersion != null) {
		stream.writeByte(16);
		ProtocolParser.writeUInt64(stream, this.clientVersion);
	}
};
