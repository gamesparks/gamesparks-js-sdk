var RTVal = function() {
	this.long_val = null;
  	this.float_val = null;
  	this.double_val = null;
  	this.data_val = null;
  	this.string_val = null;
  	this.vec_val = null;
};

RTVal.prototype = {
	serializeLengthDelimited: function(stream) {
		var ms = PooledObjects.memoryStreamPool.pop();

		if (this.string_val) {
			ms.writeByte(10);
			ProtocolParser.writeString(ms, this.string_val);
		} else if (this.data_val) { 
			ms.writeByte(114);
			RTData.writeRTData(ms, this.data_val); 
		} else if (this.vec_val) {
			var vec_value = this.vec_val;
			var numberOfFloatsSet = 0;

			ms.writeByte(18);

			if (vec_value.x != null) {
				numberOfFloatsSet = numberOfFloatsSet + 1;
			}
			if (vec_value.y != null) {
				numberOfFloatsSet = numberOfFloatsSet + 1;
			}
			if (vec_value.z != null) {
				numberOfFloatsSet = numberOfFloatsSet + 1;
			}
			if (vec_value.w != null) {
				numberOfFloatsSet = numberOfFloatsSet + 1;
			}

			ProtocolParser.writeUInt32(ms, 4 * numberOfFloatsSet);

			for (var i = 1; i <= numberOfFloatsSet; i ++) {
				if (i == 1) {
					ProtocolParser.writeSingle(ms, vec_value.x);
				} else if (i == 2) {
					ProtocolParser.writeSingle(ms, vec_value.y);
				} else if (i == 3) {
					ProtocolParser.writeSingle(ms, vec_value.z);
				} else if (i == 4) {
					ProtocolParser.writeSingle(ms, vec_value.w);
				}
			}
		}

		var data = ms.getBuffer();

		ProtocolParser.writeBytes(stream, data, ms.getPosition());

		PooledObjects.memoryStreamPool.push(ms);
	},

	reset: function() {
		if (this.data_val) {
			this.data_val.dispose();
		}
		this.long_val = null;
		this.float_val = null;
		this.double_val = null;
		this.data_val = null;
		this.string_val = null;
		this.vec_val = null;
	},

	dirty: function() {
		if (this.long_val != null) {
	    	return true;
		} else if (this.float_val != null) {
	    	return true;
	  	} else if (this.double_val != null) {
	    	return true;
	  	} else if (this.data_val) {
	    	return true;
	  	} else if (this.string_val) {
	    	return true;
	  	} else if (this.vec_val) {
	    	return true;
	  	}
	  
	  	return false;
	},

	asString: function() {
		if (this.long_val != null) {
			return this.long_val.toString();
		} else if (this.float_val != null) {
			return this.float_val.toString();
		} else if (this.double_val != null) {
			return this.double_val.toString();
		} else if (this.data_val) {
			return this.data_val.toString();
		} else if (this.string_val) {
			return "\"" + this.string_val + "\"";
		} else if (this.vec_val) {
			var ret = "|";

			if (this.vec_val.x != null) {
				ret = ret + this.vec_val.x.toString() + "|";
			}
			if (this.vec_val.y != null) {
				ret = ret + this.vec_val.y.toString() + "|";
			}
			if (this.vec_val.z != null) {
				ret = ret + this.vec_val.z.toString() + "|";
			}
			if (this.vec_val.w != null) {
				ret = ret + this.vec_val.w.toString() + "|";
			}

			return ret;
		}

		return null;
	}
};

RTVal.newLong = function(value) {
	var instance = new RTVal();

	instance.long_val = value;
	
  	return instance;
};

RTVal.newFloat = function(value) {
	var instance = new RTVal();

	instance.float_val = value;

  	return instance;
};

RTVal.newDouble = function(value) {
	var instance = new RTVal();

	instance.double_val = value;

  	return instance;
};

RTVal.newRTData = function(value) {
	var instance = new RTVal();

	instance.data_val = value;

	return instance;
};

RTVal.newString = function(value) {
	var instance = new RTVal();

	instance.string_val = value;
	
	return instance;
};

RTVal.newRTVector = function(value) {
	var instance = new RTVal();

	instance.vec_val = value;

	return instance;
};

RTVal.deserializeLengthDelimited = function(stream) {
	var instance = new RTVal();

	var limit = ProtocolParser.readUInt32(stream);

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

		if (keyByte == 10) {
			instance.string_val = ProtocolParser.readString(stream);

			_continue = true;
		} else if (keyByte == 18) {
			var end2 = ProtocolParser.readUInt32(stream);

			end2 = end2 + stream.getPosition();

			var v = new RTVector();

			var i = 0;
			while (stream.getPosition() < end2) {
				var read = ProtocolParser.readSingle(stream);

				if (i == 0) {
					v.x = read;
				} else if (i == 1) {
					v.y = read;
				} else if (i == 2) {
					v.z = read;
				} else if (i == 3) {
					v.w = read;
				}

				i = i + 1;
			}
			instance.vec_val = v;

			if (stream.getPosition() != end2) {
				console.log("WARNING: Read too many bytes in packed data");

				return null;
			}

			_continue = true;
		} else if (keyByte == 114) {
			if (instance.data_val == null) {
				instance.data_val = RTDataSerializer.cache.pop();
			}
			RTData.readRTData(stream, instance.data_val);

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