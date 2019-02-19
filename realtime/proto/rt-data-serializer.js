RTDataSerializer = {};

RTDataSerializer.cache = new ObjectPool(function() {
    return new RTData();
}, function(rtData) {
    for (var i = 0; i < rtData.data.length; i ++) {
        if (rtData.data[i].data_val) {
            rtData.data[i].data_val.dispose();
        }
        rtData.data[i].reset();
    }
}, 5);

RTDataSerializer.get = function() {
    return RTDataSerializer.cache.pop();
}

RTDataSerializer.readRTData = function(stream, instance) {
    if (instance == null) {
        instance = RTDataSerializer.cache.pop();
    }
  
  	var limit = ProtocolParser.readUInt32(stream);
 
  	limit = limit + stream.getPosition();
  
  	while (true) {
        if (stream.getPosition() >= limit) {
            if (stream.getPosition() == limit) {
                break;
      		} else {
        		console.log("WARNING: Read past max limit");
        
        		return null;
      		}
        }
    
        var keyByte = stream.readByte();
    
        if (keyByte == -1) {
            break;
        }
    
        var key = ProtocolParser.readKey(keyByte, stream);
    
        if (key.wireType == Wire.VARINT) {
            instance.data[key.field] = RTVal.newLong(ProtocolParser.readZInt64(stream));
        } else if (key.wireType == Wire.FIXED32) {
            instance.data[key.field] = RTVal.newFloat(ProtocolParser.readSingle(stream));
        } else if (key.wireType == Wire.FIXED64) {
            instance.data[key.field] = RTVal.newDouble(ProtocolParser.readDouble(stream));
        } else if (key.wireType == Wire.LENGTH_DELIMITED) {
            instance.data[key.field] = RTVal.deserializeLengthDelimited(stream);
        }
        
        if (key.field == 0) {
            console.log("WARNING: Invalid field id: 0, something went wrong in the stream");
      
      		return null;
        }
    }
  
  	return instance;
}

RTDataSerializer.writeRTData = function(stream, instance) {
    var ms = PooledObjects.memoryStreamPool.pop();

    for (var index = 1; index < instance.data.length; index ++) {
        var entry = instance.data[index];

		if (entry.long_val != null) {
            ProtocolParser.writeUInt32(ms, (index << 3));

            ProtocolParser.writeZInt64(ms, entry.long_val);
		} else if (entry.float_val != null) {
            ProtocolParser.writeUInt32(ms, ((index << 3) | 5));

            ProtocolParser.writeSingle(ms, entry.float_val);
		} else if (entry.double_val != null) {
            ProtocolParser.writeUInt32(ms, ((index << 3) | 1));

            ProtocolParser.writeDouble(ms, entry.double_val);
		} else if (entry.data_val || entry.string_val || entry.vec_val) {
            ProtocolParser.writeUInt32(ms, ((index << 3) | 2));

            entry.serializeLengthDelimited(ms);
		}
    }

    var buffer = ms.getBuffer();

    ProtocolParser.writeBytes(stream, buffer, ms.getPosition());

    PooledObjects.memoryStreamPool.push(ms);
}
