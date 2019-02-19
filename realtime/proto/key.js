var Key = function(field, wireType) {
	this.field = field;
  	this.wireType = wireType;
};

Key.prototype = {
	toString: function() {
		return "[Key: " + this.field + ", " + this.wireType + "]";
	}		
};