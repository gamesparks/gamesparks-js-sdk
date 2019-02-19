var PositionStream = function() {
	this.tempBuffer = [];
  	this.bytesRead = 0;
  	this.stream = null;
};

PositionStream.prototype = {
	wrap: function(baseStream) {
  		this.bytesRead = 0;
  		this.stream = baseStream;
  	},

  	read: function(buffer, offset, count) {
		var ret = this.stream.read(buffer, offset, count);

		this.bytesRead = this.bytesRead + ret[0];

		return ret;
	},

	readByte: function() {
		var ret = this.read(this.tempBuffer, 0, 1);

		if (ret[0] == 1) {
			this.tempBuffer = ret[1];

			return this.tempBuffer[0];
		}

		return -1;
	},

	seek: function(offset) {
		for (var i = 0; i < offset; i ++) {
			this.readByte();
		}

		return this.bytesRead;
	},

	getLength: function() {
		return this.stream.getLength();
	},

	getPosition: function() {
		return this.bytesRead;
	}
};