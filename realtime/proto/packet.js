var Packet = function() {
	this.opCode = 0
	this.sequenceNumber = null;
	this.requestId = null;
	this.targetPlayers = null;
	this.sender = null;
	this.reliable = null;
	this.data = null;
	this.payload = null;
	this.request = null;
	this.hasPayload = false;
	this.command = null;
	this.session = null;
};

Packet.prototype = {
	reset: function() {
		this.opCode = 0;
		this.sequenceNumber = null;
		this.requestId = null;
		this.targetPlayers = null;
		this.sender = null;
		this.reliable = null;
		this.payload = null;
		this.command = null;
		this.request = null;
		this.hasPayload = false;
		this.data = null;
	},

	toString: function() {
  		return "{OpCode:" + this.opCode + ",TargetPlayers:" + this.targetToString() + "}";
  	},

  	targetToString: function() {
		var s = "[";

		if (this.targetPlayers != null) {
			for (var i = 0; i < this.targetPlayers.length; i ++) { 
				s = s + this.targetPlayers[i] + " ";
			}
		}

		return s + "]";
	},

	readPayload: function(stream, packetSize) {
		this.hasPayload = true;
		if (this.sender != null) {
			this.command = CommandFactory.getCommand(this.opCode, this.sender, this.sequenceNumber, stream, this.session, this.data, packetSize);
		} else {
			this.command = CommandFactory.getCommand(this.opCode, 0, this.sequenceNumber, stream, this.session, this.data, packetSize);
		}

		return null;
	},

	writePayload: function(stream) {
		if (this.request != null) {
			var ms = PooledObjects.memoryStreamPool.pop();

			this.request.serialize(ms);

			var written = ms.getBuffer();

			if (ms.getPosition() > 0) {
				stream.writeByte(122);
				ProtocolParser.writeBytes(stream, written, ms.getPosition());
			}

			PooledObjects.memoryStreamPool.push(ms);
		} else if (this.payload != null) {
			stream.writeByte(122);
			ProtocolParser.writeBytes(stream, this.payload, this.payload.length);
		}
	}
};

Packet.serialize = function(stream, instance) {
	stream.writeByte(8);
	//console.log(stream.toHex());
	ProtocolParser.writeZInt32(stream, instance.opCode);
	//console.log(stream.toHex());

	//console.log("serialize " + instance.opCode);
  
  	//console.log("AAA " + stream.getPosition());

	if (instance.sequenceNumber != null) {
		stream.writeByte(16);
		ProtocolParser.writeUInt64(stream, instance.sequenceNumber);
	}

	//console.log("BBB " + stream.getPosition());

	if (instance.requestId != null) {
		stream.writeByte(24);
		ProtocolParser.writeUInt64(stream, instance.requestId);
	}

	//console.log("CCC " + stream.getPosition());

	if (instance.targetPlayers != null) {
		for (var i = 0; i < instance.targetPlayers.length; i ++) {
			stream.writeByte(32);
			ProtocolParser.writeUInt64(stream, instance.targetPlayers[i]);
		}
	}

	//console.log("DDD " + stream.getPosition());

	if (instance.sender != null) {
		stream.writeByte(40);
		ProtocolParser.writeUInt64(stream, instance.sender);
	}

	//console.log("EEE " + stream.getPosition());

	if (instance.reliable != null) {
		stream.writeByte(48);
		ProtocolParser.writeBool(stream, instance.reliable);
	}

	//console.log("FFF " + stream.getPosition());

	if (instance.data != null) {
		stream.writeByte(114);
		RTData.writeRTData(stream, instance.data);
	}

	//console.log("GGG " + stream.getPosition());

	instance.writePayload(stream);

	//console.log("HHH " + stream.getPosition());

	return stream;
};

Packet.serializeLengthDelimited = function(stream, instance) {
	var ms = PooledObjects.memoryStreamPool.pop();
	var ret;

	Packet.serialize(ms, instance);

	var data = ms.getBuffer();

	ProtocolParser.writeBytes(stream, data, ms.getPosition());

	ret = ms.getPosition();

	PooledObjects.memoryStreamPool.push(ms);

	return ret;
};

Packet.deserializeLengthDelimited = function(stream, instance) {
	var limit = ProtocolParser.readUInt32(stream);
	var origLimit = limit;

	limit = limit + stream.getPosition();

	while (true) {
		if (stream.getPosition() >= limit) {
			if (stream.getPosition() == limit) {
				break;
			} else {
				console.log("WARNING: Read past max limit");

				return 0;
			}
		}

		var keyByte = stream.readByte();

		if (keyByte == -1) {
			console.log("WARNING: End of stream");

			return 0;
		}

		var _continue = false;

		if (keyByte == 8) {
			instance.opCode = ProtocolParser.readZInt32(stream);

			_continue = true;
		} else if (keyByte == 16) {
			instance.sequenceNumber = ProtocolParser.readUInt64(stream);

			_continue = true;
		} else if (keyByte == 24) {
			instance.requestId = ProtocolParser.readUInt64(stream);

			_continue = true;
		} else if (keyByte == 40) {
			instance.sender = ProtocolParser.readUInt64(stream);

			_continue = true;
		} else if (keyByte == 48) {
			instance.reliable = ProtocolParser.readBool(stream);

			_continue = true;
		} else if (keyByte == 114) {
			//PooledObjects.positionStreamPool:pop()
			if (instance.data == null) {
				instance.data = RTData.readRTData(stream, instance.data);
			} else {
				RTData.readRTData(stream, instance.data);
			}

			_continue = true;
		} else if (keyByte == 122) {
			instance.payload = instance.readPayload(stream, origLimit);

			_continue = true;
		}

		if (!_continue) {
			var key = ProtocolParser.readKey(keyByte, stream);
			if (key.field == 0) {
				console.log("WARNING: Invalid field id: 0, something went wrong in the stream");

				return 0;
			} else {
				ProtocolParser.skipKey(stream, key);
			}
		}
	}

	return origLimit;
};