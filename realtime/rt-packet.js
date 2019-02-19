var RTPacket = function(opCode, sender, limitedStream, limit, data, packetSize) {
	this.opCode = opCode;
 	this.sender = sender;
	this.stream = limitedStream;
	this.streamLength = limit;
	this.data = data;
	this.packetSize = packetSize;
};

RTPacket.prototype = {
	toString: function() {
		var string = "OpCode=" + this.opCode + ",Sender=" + this.sender + ",streamExists=";

		if (this.stream != null) {
			string = string + "true,StreamLength=" + this.streamLength;
		} else {
			string = string + "false";
		}

		string = string + ",Data=";

		if (this.data != null) {
			string = string + this.data.toString();
		} else {
			string = string + ".PacketSize=" + this.packetSize;
		}

		return string;
	}
};
