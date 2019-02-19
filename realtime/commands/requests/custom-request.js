var CustomRequest = function() {
	RTRequest.call(this);

  	this.payload = null;
};

CustomRequest.prototype = Object.create(RTRequest.prototype);

CustomRequest.prototype.configure = function(opCode, intent, payload, data, targetPlayers) {
	this.opCode = opCode;
	this.payload = payload;
	this.intent = intent;
	this.data = data;
	if (targetPlayers != null) {
		for (var i in targetPlayers) { 
			this.targetPlayers.push(targetPlayers[i]); 
		}
	}
}

CustomRequest.prototype.toPacket = function(session, fast) {
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

CustomRequest.prototype.serialize = function(stream) {
	if (this.payload) {
    	stream.writeBytes(this.payload, 0, this.payload.length);
  	}
};

CustomRequest.prototype.reset = function() {
	this.payload = null;
	RTRequest.prototype.reset.call(this);
};
