ProtocolParser = {};

ProtocolParser.readBool = function(stream) {
	var b = stream.readByte();

	if (b < 0) {
		console.log("WARNING: Stream ended too early");

		return false;
	} else if (b == 1) {
		return true;
	} else if (b == 0) {
		return false;
	}

	print("WARNING: Invalid boolean value");

	return false;
};

ProtocolParser.readUInt32 = function(stream) {
	var b;
	var val = 0;

	for (var n = 0; n <= 4; n ++) {
		b = stream.readByte();
		if (b < 0) {
			console.log("WARNING: Stream ended too early");

			return 0;
		}

		if (n == 4 && (b & 0xF0) != 0) {
			console.log("WARNING: Got larger VarInt than 32bit unsigned");

			return 0;
		}

		if ((b & 0x80) == 0) {
			return (val | (b << (7 * n)));
		}

		val = (val | ((b & 0x7F) << (7 * n)));
	}

	console.log("WARNING: Got larger VarInt than 32bit unsigned");

	return 0;
};

ProtocolParser.readZInt32 = function(stream) {
	var val = ProtocolParser.readUInt32(stream);
  
  	return ((val >> 1) ^ ((val << 31) >> 31));
};

ProtocolParser.readSingle = function(stream) {
	var bytes = [];
	var val = 0;

	for (var n = 1; n <= 4; n ++) {
		bytes[4 - n] = stream.readByte();
	}

	val = (((bytes[0] << 24) | (bytes[1] << 16)) | ((bytes[2] << 8) | bytes[3]));

	var negative = (bytes[0] & 0x80) == 0x80;
	var exponent = ((val & 0x7f800000) >> 23);    
	var sign;
	var mantissa = 0;

	if (negative) {
		sign = -1;
	} else {
		sign = 1;
	}

	if (exponent == 255) {
		if (negative) {
			value = Number.NEGATIVE_INFINITY;
		} else {
			value = Number.POSITIVE_INFINITY;
		}
	} else if (exponent == 0) {
		value = 0;
	} else {
		exponent = exponent - 127 + 1;

		for (var i = 3; i >= 2; i --) {
			mantissa += bytes[i];
			mantissa /= 256;
		}
		mantissa += (bytes[1] & 0x7F);
		mantissa = (mantissa / 128 + 1) / 2.0;

		var value = sign * Math.pow(2.0, exponent) * mantissa;
	}

	return value;
};

ProtocolParser.readUInt64 = function(stream) {
	var b;
	var val = 0;

	for (var n = 0; n <= 9; n ++) {
		b = stream.readByte();
		if (b < 0) {
			console.log("WARNING: Stream ended too early");

			return 0;
		}

		if (n == 9 && (b & 0xFE) != 0) {
			console.log("WARNING: Got larger VarInt than 64 bit unsigned");

			return 0;
		}

		if ((b & 0x80) == 0) {
			return val + b * Math.pow(128, n);
		}

		val = val + (b & 0x7F) * Math.pow(128, n);
	}

	console.log("WARNING: Got larger VarInt than 64 bit unsigned");

	return 0;
};

ProtocolParser.readZInt64 = function(stream) {
	var val = ProtocolParser.readUInt64(stream);
	
	if (val % 2 == 1) {
		return Math.floor(-val / 2);
	} else {
		return Math.floor(val / 2);
	}
};

ProtocolParser.readDouble = function(stream) {
	var bytes = [];
	var valh = 0;

	for (var n = 1; n <= 8; n ++) {
		bytes[8 - n] = stream.readByte();
	}

	valh = (bytes[0] << 24) | (bytes[1] << 16);
	
	var negative = (bytes[0] & 0x80) == 0x80;
	var exponent = ((valh & 0x7ff00000) >> 20);  
	var mantissa = 0;  
	var sign;

	if (negative) {
		sign = -1;
	} else {
		sign = 1;
	}

	if (exponent == 2047) {
		if (negative) {
			value = Number.NEGATIVE_INFINITY;
		} else {
			value = Number.POSITIVE_INFINITY;
		}
	} else if (exponent == 0) {
		value = 0;
	} else {
		exponent = exponent - 1023 + 1;

		for (var i = 7; i >= 2; i --) {
			mantissa += bytes[i];
			mantissa /= 256;
		}
		mantissa += (bytes[1] & 0xF);
		mantissa = (mantissa / 16 + 1) / 2.0;

		var value = sign * Math.pow(2.0, exponent) * mantissa;
	}

	return value;
};

ProtocolParser.readString = function(stream) {
	var length = ProtocolParser.readUInt32(stream);
	var ms = PooledObjects.memoryStreamPool.pop();
	var buffer = PooledObjects.byteBufferPool.pop();
	var read = 0;
	var ret;
	var r;

	while (read < length) {
		ret = stream.read(buffer, 0, Math.min(length - read, buffer.length));
		r = ret[0];
		buffer = ret[1];

		if (r == 0) {
			console.log("WARNING: Expected " + (length - read).toString() + " got " + read);

			return 0;
		}
		ms.writeBytes(buffer, 0, r);
		read = read + r;
	}

	ret = ms.toString().slice(0, ms.getPosition());
	
	PooledObjects.byteBufferPool.push(buffer);
	PooledObjects.memoryStreamPool.push(ms);

	return ret;
};

ProtocolParser.readKey = function(firstByte, stream) {
  	if (firstByte < 128) {
    	return new Key((firstByte >> 3), (firstByte & 0x07));
  	}
  
  	var fieldID = ((ProtocolParser.readUInt32(stream) << 4) | ((firstByte >> 3) & 0x0F));
  
	return new Key(fieldID, (firstByte & 0x07));
};

ProtocolParser.skipKey = function(stream, key) {
	if (key.wireType == Wire.FIXED32) {
		stream.seek(4);
	} else if (key.wireType == Wire.FIXED64) {
		stream.seek(8);
	} else if (key.wireType == Wire.LENGTH_DELIMITED) {
		stream.seek(ProtocolParser.readUInt32(stream));
	} else if (key.wireType == Wire.VARINT) {
		ProtocolParser.readSkipVarInt(stream);
	} else {
		console.log("WARNING: Unknown wire type: " + key.wireType);
	}
};

ProtocolParser.readSkipVarInt = function(stream) {
	while (true) {
		var b = stream.readByte();

		if (b < 0) {
			console.log("WARNING: Stream ended too early");

			return;
		}

		if ((b & 0x80) == 0) {
			return;
		}
	}
};

ProtocolParser.writeBool = function(stream, val) {
	if (val) {
		return stream.writeByte(1);
	} else {
		return stream.writeByte(0);
	}
};

ProtocolParser.writeUInt32 = function(stream, val) {
	var b;

	val = Math.abs(val);

	while (true) {
		b = (val & 0x7F);
		val = (val >>> 7);
		if (val == 0) {
			stream.writeByte(b);

			break;
		} else {
			b = (b | 0x80);

			stream.writeByte(b);
		}
	}
};

ProtocolParser.writeZInt32 = function(stream, val) {
	var val1 = (val << 1);
  	var val2 = (val >> 31);

  	ProtocolParser.writeUInt32(stream, (val1 ^ val2));
};

ProtocolParser.writeUInt64 = function(stream, val) {
	var b;

	val = Math.abs(val);

	while (true) {
		b = (val & 0x7F);
		val = Math.floor(val / 128);
		if (val == 0) {
			stream.writeByte(b);

			break;
		} else {
			b = (b | 0x80);

			stream.writeByte(b);
		}
	}
};

ProtocolParser.writeZInt64 = function(stream, val) {
	var sign = false;
  
  	if (val < 0) { 
  		val = val + 1;
  		
    	val = -val;
    
    	sign = true;
  	}
  
  	val = val * 2;
  
  	if (sign == true) {
    	val = val + 1;
  	}
  
  	ProtocolParser.writeUInt64(stream, val);
};

ProtocolParser.frexp = function(arg) {
  //  discuss at: http://locutus.io/c/frexp/
  // original by: Oskar Larsson Högfeldt (http://oskar-lh.name/)
  //      note 1: Instead of
  //      note 1: double frexp( double arg, int* exp );
  //      note 1: this is built as
  //      note 1: [double, int] frexp( double arg );
  //      note 1: due to the lack of pointers in JavaScript.
  //      note 1: See code comments for further information.
  //   example 1: frexp(1)
  //   returns 1: [0.5, 1]
  //   example 2: frexp(1.5)
  //   returns 2: [0.75, 1]
  //   example 3: frexp(3 * Math.pow(2, 500))
  //   returns 3: [0.75, 502]
  //   example 4: frexp(-4)
  //   returns 4: [-0.5, 3]
  //   example 5: frexp(Number.MAX_VALUE)
  //   returns 5: [0.9999999999999999, 1024]
  //   example 6: frexp(Number.MIN_VALUE)
  //   returns 6: [0.5, -1073]
  //   example 7: frexp(-Infinity)
  //   returns 7: [-Infinity, 0]
  //   example 8: frexp(-0)
  //   returns 8: [-0, 0]
  //   example 9: frexp(NaN)
  //   returns 9: [NaN, 0]
  // Potential issue with this implementation:
  // the precisions of Math.pow and the ** operator are undefined in the ECMAScript standard,
  // however, sane implementations should give the same results for Math.pow(2, <integer>) operations
  // Like frexp of C and std::frexp of C++,
  // but returns an array instead of using a pointer argument for passing the exponent result.
  // Object.is(n, frexp(n)[0] * 2 ** frexp(n)[1]) for all number values of n except when Math.isFinite(n) && Math.abs(n) > 2**1023
  // Object.is(n, (2 * frexp(n)[0]) * 2 ** (frexp(n)[1] - 1)) for all number values of n
  // Object.is(n, frexp(n)[0]) for these values of n: 0, -0, NaN, Infinity, -Infinity
  // Math.abs(frexp(n)[0]) is >= 0.5 and < 1.0 for any other number-type value of n
  // See http://en.cppreference.com/w/c/numeric/math/frexp for a more detailed description
  arg = Number(arg)
  const result = [arg, 0]
  if (arg !== 0 && Number.isFinite(arg)) {
    const absArg = Math.abs(arg)
    // Math.log2 was introduced in ES2015, use it when available
    const log2 = Math.log2 || function log2 (n) { return Math.log(n) * Math.LOG2E }
    let exp = Math.max(-1023, Math.floor(log2(absArg)) + 1)
    let x = absArg * Math.pow(2, -exp)
    // These while loops compensate for rounding errors that sometimes occur because of ECMAScript's Math.log2's undefined precision
    // and also works around the issue of Math.pow(2, -exp) === Infinity when exp <= -1024
    while (x < 0.5) {
      x *= 2
      exp--
    }
    while (x >= 1) {
      x *= 0.5
      exp++
    }
    if (arg < 0) {
      x = -x
    }
    result[0] = x
    result[1] = exp
  }
  return result
};

ProtocolParser.writeSingle = function(stream, val) {
	var bytes = [0, 0, 0, 0];

	if (val != 0) {
		var anum = Math.abs(val);
		var ret = ProtocolParser.frexp(anum);
		var mantissa = ret[0];
		var exponent = ret[1];

		var sign = val != anum && 128 || 0;

		mantissa = mantissa * 2 - 1;
		if (mantissa == Infinity) {
			mantissa = 0;
			exponent = 255;	
		} else {
			exponent = exponent - 1;
			exponent = exponent + 127;
			if (exponent < 0 || exponent >= 255) {
				mantissa = 0;
				if (exponent < 0) {
					exponent = 0;
				} else {
					exponent = 255;	
				}
			}
		}

		bytes[0] = sign + (exponent >> 1);
		mantissa *= 128;

		var currentmantissa = Math.floor(mantissa);

		mantissa -= currentmantissa;
		bytes[1] = ((exponent & 0x1) << 7) + currentmantissa;
		for (var i = 2; i < 4; i ++) {
			mantissa *= 256;
			currentmantissa = Math.floor(mantissa)
			mantissa -= currentmantissa;
			bytes[i] = currentmantissa;
		}
	}

	for (var i = bytes.length - 1; i >= 0; i --) {
		stream.writeByte(bytes[i]);
	}
};

ProtocolParser.writeDouble = function(stream, val) {
	var bytes = [0, 0, 0, 0, 0, 0, 0, 0];

	if (val != 0) {
		var anum = Math.abs(val);
		var ret = ProtocolParser.frexp(anum);
		var mantissa = ret[0];
		var exponent = ret[1];

		var sign = val != anum && 128 || 0;
		
		mantissa = mantissa * 2 - 1;
		if (mantissa == Infinity) {
			mantissa = 0;
			exponent = 2047;	
		} else {
			exponent = exponent - 1;
			exponent = exponent + 1023;
			if (exponent < 0 || exponent >= 2047) {
				mantissa = 0;
				if (exponent < 0) {
					exponent = 0;
				} else {
					exponent = 2047;	
				}	
			}
		}

		bytes[0] = sign + (exponent >> 4);
		mantissa *= 16;

		var currentmantissa = Math.floor(mantissa);

		mantissa -= currentmantissa;
		bytes[1] = ((exponent & 0xF) << 4) + currentmantissa;
		for (var i = 2; i < 8; i ++) {
			mantissa *= 256;
			currentmantissa = Math.floor(mantissa);
			mantissa -= currentmantissa;
			bytes[i] = currentmantissa;
		}
	}

	for (var i = bytes.length - 1; i >= 0; i --) {
		stream.writeByte(bytes[i]);
	}
};

ProtocolParser.writeBytes = function(stream, val, len) {
	ProtocolParser.writeUInt32(stream, len);
  	stream.writeBytes(val, 0, len);
};

ProtocolParser.writeString = function(stream, val) {
	var array = [];
  
  	for (var i = 0; i < val.length; i ++) {
    	array.push(val.charCodeAt(i));
  	}
  
  	ProtocolParser.writeBytes(stream, array, val.length);
};