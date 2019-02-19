var PingResult = function() {
	AbstractResult.call(this);
};

PingResult.pool = new ObjectPool(function() {
	return new PingResult();
}, null, 5);

PingResult.prototype = Object.create(AbstractResult.prototype);

PingResult.prototype.execute = function() {
	this.session.log("PingResult", GameSparksRT.LogLevel.DEBUG, "");
  
  	PingResult.pool.push(this);
};

PingResult.prototype.executeAsync = function() {
  	return false;
};

PingResult.deserialize = function(stream, instance) {
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
