var PingCommand = function(token) {
    RTRequest.call(this);

    this.opCode = -2;
};

PingCommand.prototype = Object.create(RTRequest.prototype);

PingCommand.prototype.toPacket = function(session, fast) {
    var p = PooledObjects.packetPool.pop();

    p.opCode = this.opCode;
    p.data = this.data;
    p.session = session;

    if (!fast && this.intent != GameSparksRT.deliveryIntent.RELIABLE) {
        p.reliable = false;
    }

    if (this.intent == GameSparksRT.deliveryIntent.UNRELIABLE_SEQUENCED) {
        p.sequenceNumber = session.nextSequenceNumber();
    }

    if (this.targetPlayers.length > 0) {
        p.targetPlayers = this.targetPlayers;
    }

    p.request = this;

    return p;
};

PingCommand.prototype.serialize = function(stream) {
};

