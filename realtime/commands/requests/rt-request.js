var RTRequest = function() {
    this.data = null;
  	this.opCode = 0;
  	this.targetPlayers = [];
  	this.intent = GameSparksRT.deliveryIntent.RELIABLE;
};

RTRequest.prototype = {
	toPacket: function(session, fast) {
  		return null;
  	},

  	reset: function() {
  		this.targetPlayers = [];
 	},

	serialize: function(stream) {
	}
};
