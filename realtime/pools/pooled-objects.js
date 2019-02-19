PooledObjects = {};

PooledObjects.packetPool = new ObjectPool(function() {
    return new Packet();
}, function(packet) {
    packet.reset();
}, 5);

PooledObjects.memoryStreamPool = new ObjectPool(function() {
  	return new Stream();
}, function(stream) {
  	stream.setPosition(0);
}, 5);

PooledObjects.positionStreamPool = {};

PooledObjects.limitedPositionStreamPool = new ObjectPool(function() {
  	return new LimitedPositionStream();
}, null, 5);

PooledObjects.byteBufferPool = new ObjectPool(function() {
  	var array = [];
    
  	for (var i = 0; i < 256; i ++) {
        array.push(0);
  	}
  
	 return array;
}, null, 5);

PooledObjects.customRequestPool = new ObjectPool(function() {
    return new CustomRequest();
}, function(cr) {
  	cr.reset();
}, 5);
