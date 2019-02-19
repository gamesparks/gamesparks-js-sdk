function assert(condition, message) {
    if (!condition) {
        message = message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(message);
        }
        throw message; // Fallback
    }
}

var Stream = function() {
	this.buffer = "";
  	this.position = 0;
};

Stream.prototype = {
	getPosition: function() {
		return this.position;
  	},

	setPosition: function(position) {
  		this.position = position;
	},

	getLength: function() {
  		return this.buffer.length;
	},

	bytesAvailable: function() {
  		return this.buffer.length - this.position;
	},

	readByte: function() {
		var ret = this.readChar();
	  
	  	if (typeof ret === "number" && ret == -1) {
	    	return 0;
	  	} else {
	    	return ret.charCodeAt(0);
	  	}
	},

	readChar: function() {
		var buffer = "";
		var totalBytes;
		var ret;

		ret = this.readChars(buffer, this.position, 1);
		totalBytes = ret[0];
		buffer = ret[1];
		if (totalBytes == 1) {
			return buffer.slice(0, 1);
		} else {
			return -1;
		}
	},

	readChars: function(buffer, position, length) {
		assert(typeof buffer === "string", "buffer must be string");
	  
	  	if (this.bytesAvailable() <= 0) {
	    	console.log("WARNING: Reached end of the stream");
	   
	    	return [0, buffer];
	  	}
	  
	  	if (length <= 0) {
	    	console.log("WARNING: no characters read (length = 0)");
	    
	    	return [0, buffer];
	  	}
	  
	  	if (buffer.length > 0) {
	    	assert(position >= 0 && position < buffer.length, "position out of range");
	  	} else {
	    	position = 0;
	  	}
	  
	  	var subString;
	  	var newBuffer = "";
	  	var startPosition = this.position;
	  	var endPosition = startPosition + length;
	  	var newLength;
	  
	  	if (endPosition > this.buffer.length) {
	    	endPosition = this.buffer.length;
	  	}
	  
	  	newLength = endPosition - startPosition;
	  
	  	subString = this.buffer.slice(startPosition, endPosition);
	  
	  	this.position = endPosition;
	  
	  	if (position == 0) {
	    	newBuffer = subString;
	    
	    	if (subString.length < buffer.length) {
	      		newBuffer = newBuffer + buffer.slice(newLength);
	    	}
	  	} else {
	    	newBuffer = buffer.slice(0, position) + subString;
	    
	    	if (position + newLength + 1 <= buffer.length) {
	      		newBuffer = newBuffer + buffer.slice(position + newLength);
	    	}
	  	}
	  
	  	return [newLength, newBuffer];
	},

	read: function(buffer, position, length) {
		assert(typeof buffer === "object" && Array.isArray(buffer), "buffer must be array");

		var ret;
		var totalBytes;
		var newBuffer = "";
		var newArray = [];

		for (var i = 0; i < buffer.length; i ++) {
			newBuffer = newBuffer + String.fromCharCode(buffer[i]);
		}

		ret = this.readChars(newBuffer, position, length);
		totalBytes = ret[0];
		newBuffer = ret[1];

		for (var i = 0; i < newBuffer.length; i ++) {
			newArray.push(newBuffer.charCodeAt(i));
		}

		return [totalBytes, newArray];
	},

	writeByte: function(byte) {
  		assert(typeof byte === "number", "not valid byte");
  		assert(byte >= 0 && byte <= 255, "not valid byte");
  
  		this.writeChar(String.fromCharCode(byte));
	},

	writeChar: function(char) {
  		this.writeChars(char, 0, 1);
  	},

  	writeChars: function(buffer, position, length) {
  		assert(typeof buffer === "string", "buffer must be string");
  
		assert(buffer && buffer.length > 0, "buffer must not be nil or empty");

		if (this.bytesAvailable() < 0) {
			console.log("WARNING: Reached end of the stream");

			return;
		}

		if (length <= 0) {
			console.log("WARNING: no characters written (length = 0)");

			return [0, buffer];
		}

		assert(position >= 0 && position < buffer.length, "position out of range");

		var subString;
		var newBuffer = "";
		var startPosition = position;
		var endPosition = startPosition + length;
		var newLength;

		if (endPosition > buffer.length) {
			endPosition = buffer.length;
		}

		newLength = endPosition - startPosition;

		subString = buffer.slice(startPosition, endPosition);

		if (this.position == 0) {
			newBuffer = subString;
			if (this.buffer.length > subString.length) {
		  		newBuffer = newBuffer + this.buffer.slice(newLength);
			}
		} else {
			newBuffer = this.buffer.slice(0, this.position) + subString;

			if (this.position + newLength + 1 <= this.buffer.length) {
		  		newBuffer = newBuffer + this.buffer.slice(this.position + newLength);
			}
		}

		this.buffer = newBuffer;
		this.position = this.position + newLength;
  	},

  	writeBytes: function(buffer, position, length) {
		assert(typeof buffer === "object" && Array.isArray(buffer), "buffer must be array");

		var newBuffer = "";

		for (var i = position; i < position + length; i ++) {
			if (i >= buffer.length) {
				break;
			}

			newBuffer = newBuffer + String.fromCharCode(buffer[i]);
		}

		this.writeChars(newBuffer, 0, length);
	},

  	seek: function(offset) {
		this.position = this.position - offset;

		if (this.position < 0) {
			this.position = 0;
		} else if (this.position >= this.buffer.length) {
			this.position = this.buffer.length - 1;
		}
	},

	toHex: function() {
		var ret = "";

		for (var i = 0; i < Math.ceil(this.buffer.length / 16) * 16; i ++) {
			if (i % 16 == 0) { 
				var value = i.toString(16);

				for (var a = value.length; a < 8; a ++) {
					ret = ret + "0";
				}
				ret = ret + value + "  ";
			}
			if (i >= this.buffer.length) {
				ret = ret + "## ";
			} else {
				var value = this.buffer.charCodeAt(i).toString(16);

				for (var a = value.length; a < 2; a ++) {
					ret = ret + "0";
				}
				ret = ret + value + " ";
			}
			if ((i + 1) %  8 == 0) { 
				ret = ret + " "; 
			}
			if ((i + 1) % 16 == 0) { 
				var value = this.buffer.slice(i - 16 + 1, i + 1);

				ret = ret + value.replace("[^\x20-\x7E]", ".") + "\n";
			}
		}

		return ret;
	},

	toString: function() {
  		return this.buffer;
	},

	getBuffer: function() {
		var buffer = []
	  
	  	for (var i = 0; i < this.buffer.length; i ++) {
	    	buffer.push(this.buffer.charCodeAt(i));
	  	}
	  
	  	return buffer;
	}
};