CommandFactory = {};

CommandFactory.getCommand = function(opCode, sender, sequence, stream, session, data, packetSize) {
    var ret = null;
    var limit = ProtocolParser.readUInt32(stream);
    var lps = PooledObjects.limitedPositionStreamPool.pop();

    lps.wrap(stream, limit);

    if (opCode == OpCodes.LOGIN_RESULT) {
        ret = LoginResult.deserialize(lps, LoginResult.pool.pop());
    } else if (opCode == OpCodes.PING_RESULT) {
        ret = PingResult.deserialize(lps, PingResult.pool.pop());
    } else if (opCode == OpCodes.UDP_CONNECT_MESSAGE) {
        ret = UDPConnectMessage.deserialize(lps, UDPConnectMessage.pool.pop());
    } else if (opCode == OpCodes.PLAYER_CONNECT_MESSAGE) {
        ret = PlayerConnectMessage.deserialize(lps, PlayerConnectMessage.pool.pop());
    } else if (opCode == OpCodes.PLAYER_DISCONNECT_MESSAGE) {
        ret = PlayerDisconnectMessage.deserialize(lps, PlayerDisconnectMessage.pool.pop());
    } else {
        if (session.shouldExecute(sender, sequence)) {
            ret = CustomCommand.pool.pop().configure(opCode, sender, lps, data, limit, session, packetSize);
        }
    }

    lps.skipToEnd();

    PooledObjects.limitedPositionStreamPool.push(lps);

    return ret;
};