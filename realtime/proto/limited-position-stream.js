var LimitedPositionStream = function() {
	PositionStream.call(this);

	this.limit = 0;
};

LimitedPositionStream.prototype = Object.create(PositionStream.prototype);

LimitedPositionStream.prototype.wrap = function(baseStream, limit) {
	PositionStream.prototype.wrap.call(this, baseStream);
  
  	this.limit = limit;
};

LimitedPositionStream.prototype.read = function(buffer, offset, count) {
	var toRead;

	if (count > this.limit - this.bytesRead) {
		toRead = this.limit - this.bytesRead;
	} else {
		toRead = count;
	}

	return PositionStream.prototype.read.call(this, buffer, offset, toRead);
};

LimitedPositionStream.prototype.readByte = function() {
	if (this.bytesRead >= this.limit) {
		return -1;
	} else {
		return PositionStream.prototype.readByte.call(this);
	}
};

LimitedPositionStream.prototype.skipToEnd = function() {
	if (this.bytesRead < this.limit) {
		var discardBytes = PooledObjects.byteBufferPool.pop();

		while (this.read(discardBytes, this.bytesRead, 256)[0] == 256) {}

		PooledObjects.byteBufferPool.push(discardBytes);
	}
};
