var RTData = function() {
	this.data = [];
  	for (var i = 0; i < GameSparksRT.MAX_RTDATA_SLOTS; i ++) {
    	this.data.push(new RTVal());
  	}
};

RTData.get = function() {
  	return RTDataSerializer.cache.pop();
}

RTData.readRTData = function(stream, instance) {
  	return RTDataSerializer.readRTData(stream, instance);
}

RTData.writeRTData = function(stream, instance) {
  	RTDataSerializer.writeRTData(stream, instance);
}

RTData.prototype = {
	dispose: function() {
  		for (var i = 0; i < this.data.length; i ++) {
    		if (this.data[i].dirty()) {
      			this.data[i] = new RTVal();
    		}
  		}

  		RTDataSerializer.cache.push(this);
	},

	getRTVector: function(index) {
		return this.data[index].vec_val;
	},

	getLong: function(index) {
	  	return this.data[index].long_val;
	},

	getFloat: function(index) {
	  	return this.data[index].float_val;
	},

	getDouble: function(index) {
	  	return this.data[index].double_val;
	},

	getString: function(index) {
	  	return this.data[index].string_val;
	},

	getData: function(index) {
	  	return this.data[index].data_val;
	},

	setRTVector: function(index, value) {
	  	this.data[index] = RTVal.newRTVector(value);
	  
	  	return this;
	},

	setLong: function(index, value) {
		if (isFinite(value)) {
			this.data[index] = RTVal.newLong(value);
		} else {
			console.error("Not a valid number error");
		}
		
	  	return this;
	},

	setFloat: function(index, value) {
		if (isFinite(value)) {
			this.data[index] = RTVal.newFloat(value);
		} else {
			console.error("Not a valid number error");
		}
	  
	  	return this;
	}, 

	setDouble: function(index, value) {
		if (isFinite(value)) {
	  		this.data[index] = RTVal.newDouble(value);
	  	} else {
			console.error("Not a valid number error");
		}
	  
	  	return this;
	},

	setString: function(index, value) {
	  	this.data[index] = RTVal.newString(value);
	  
	  	return this;
	},

	setData: function(index, value) {
	  	this.data[index] = RTVal.newRTData(value);
	  
	  	return this;
	},

	toString: function() {
	  	return this.asString();
	},

	asString: function() {
		var builder = " {";
	  
	  	for (var i = 0; i < GameSparksRT.MAX_RTDATA_SLOTS; i ++) {
	    	var val = this.data[i].asString();
	    
	    	if (val != null) {
	      		builder = builder + " [" + i.toString() + " " + val + "] ";
	    	}
	  	}
	  	builder = builder + "} ";
	  
	  	return builder;
	}
};