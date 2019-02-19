var CustomCommand = function() {
    this.session = null;
    this.opCode = 0;
    this.sender = 0;
    this.limit = 0;
    this.packetSize = 0;
    this.ms = null;
    this.limitedStream = null;
    this.data = null;
};

CustomCommand.pool = new ObjectPool(function() {
  return new CustomCommand();
}, null, 5);

CustomCommand.prototype = {
    configure: function(opCode, sender, lps, data, limit, session, packetSize) {
        this.ms = PooledObjects.memoryStreamPool.pop();
        this.packetSize = packetSize;
        this.opCode = opCode;
        this.sender = sender;
        this.data = data;
        this.session = session;
        this.limit = limit;
        this.limitedStream = null;

        if (lps != null) {
            this.limitedStream = PooledObjects.limitedPositionStreamPool.pop();

            for (var i = 1; i <= limit; i ++) {
                var read = lps.readByte();

                this.ms.writeByte(read);
            }
            this.ms.setPosition(0);
            this.limitedStream.wrap(this.ms, limit);
        }

        return this;
    },

    execute: function() {
        this.session.onPacket(new RTPacket(this.opCode, this.sender, this.limitedStream, this.limit, this.data, this.packetSize));
  
        PooledObjects.memoryStreamPool.push(this.ms);
        PooledObjects.limitedPositionStreamPool.push(this.limitedStream);
        CustomCommand.pool.push(this);
    }
};