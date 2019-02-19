var AbstractResult = function() {
	this.abstractResultType = true;
  	this.packet = null;
  	this.session = null;
};

AbstractResult.prototype = {
	configure: function(packet, session) {
  		this.packet = packet;
  		this.session = session;
  	},

  	executeAsync: function() {
  		return true;
  	}
};
