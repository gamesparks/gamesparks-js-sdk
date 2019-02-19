var ReliableConnection = function(remotehost, remoteport, session) {
    Connection.call(this, session);

    this.remotehost = remotehost;
    this.remoteport = remoteport;
};

ReliableConnection.prototype = Object.create(Connection.prototype);

ReliableConnection.prototype.connect = function() {
    this.client = new WebSocket("wss://" + this.remotehost + ":" + this.remoteport);
    this.client.binaryType = "arraybuffer";
    this.client.onopen = this.onopen.bind(this);
    this.client.onclose = this.onclose.bind(this);
    this.client.onerror = this.onerror.bind(this);
    this.client.onmessage = this.onmessage.bind(this);
}

ReliableConnection.prototype.onopen = function(e) {
    if (this.stopped || this.session == null) {
        if (this.client != null) {
            this.client.close()
            this.client = null;
        }
      
        return;
    }

    this.session.log("ReliableConnection", GameSparksRT.logLevel.DEBUG, " TCP Connection Established");
    
    var loginCmd = new LoginCommand(this.session.connectToken);

    this.send(loginCmd);
};

ReliableConnection.prototype.onmessage = function(e) {
    if (this.stopped) {
        if (this.client != null) {
            this.client.close()
            this.client = null;
        }
      
        return;
    }

    var data = e.data;
    var read = data.byteLength;
    var rss = new Stream();
    var array = Array.from(new Uint8Array(data));

    //console.log(array);

    rss.writeBytes(array, 0, read);
    
    rss.setPosition(0);

    //console.log(rss.getLength());
    //console.log(rss.toHex());
    
    while (rss.getPosition() < read) {
        var p = PooledObjects.packetPool.pop();
        var bytesRead = this.read(rss, p);
    
        this.onPacketReceived(p, bytesRead);
        PooledObjects.packetPool.push(p);
        p = PooledObjects.packetPool.pop();
    }
};

ReliableConnection.prototype.onclose = function(e) {
    if (this.session != null) {
        this.session.log("ReliableConnection", GameSparksRT.logLevel.DEBUG, " TCP Connection Closed");
    }

    if (!this.stopped && this.client != null) {
        /*var myThis = this;

        setTimeout(function() {
            myThis.session.log("ReliableConnection", GameSparksRT.logLevel.DEBUG, " Reconnecting"); 
      
            myThis.connect();
        }, 1000);*/
    } else {
        //this.session = null;
    }
};

ReliableConnection.prototype.onerror = function(e) {
    if (this.session != null) {
        this.session.log("ReliableConnection", GameSparksRT.logLevel.DEBUG, " TCP Connection Error");
    }

    console.log(e);
};    

ReliableConnection.prototype.send = function(request) {
    if (this.client != null && this.client.readyState == WebSocket.OPEN) {
        var stream = new Stream();
		var p = request.toPacket(this.session, false);
		//console.log(p.toString())
        //console.log("a " + stream.getPosition() + " " + stream.getLength());
		var ret = Packet.serializeLengthDelimited(stream, p);
	    //console.log("b " + stream.getPosition() + " " +  stream.getLength());
	   
		//console.log(stream.toHex());

        var buffer = new Uint8Array(stream.getBuffer());

        //console.log(buffer);

        this.client.send(buffer);

	    PooledObjects.packetPool.push(p);

	    return ret;
    } else {
		return -1;
    }
};

ReliableConnection.prototype.read = function(stream, p) {
    if (this.stopped) {
        return 0;
    }
  
  	p.session = this.session;
  	p.reliable = true;
  
  	var ret = Packet.deserializeLengthDelimited(stream, p);
  	//console.log("ret " + ret + " " + p.reliable);
  
  	if (p.reliable == null) {
        p.reliable = true;
  	}
 
  	return ret;
};

ReliableConnection.prototype.stopInternal = function() {
    if (this.client != null && this.client.readyState == WebSocket.OPEN) {
        this.client.close();
        this.client = null;
    }
};
