/* global define, module, require */
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['crypto-js', 'ws'], factory);
	} else if (typeof module === 'object' && module.exports) {
		// Node. Export.
		module.exports = factory(require('crypto-js'), require('ws'));
	} else {
		// Browser globals (root is window)
		root.GameSparksRT = factory(root.CryptoJS, root.WebSocket || root.MozWebSocket);
	}
}(this, function(CryptoJS, WebSocket) {

	var GameSparksRT = function() {};

	GameSparksRT.MAX_RTDATA_SLOTS = 128;

	//GameSparksRT.MAX_UNRELIABLE_MESSAGE_SIZE_BYTES = 1400;

	GameSparksRT.TCP_CONNECT_TIMEOUT_SECONDS = 5;

	GameSparksRT.logLevel = {};
	GameSparksRT.logLevel.DEBUG = 0;
	GameSparksRT.logLevel.INFO = 1;
	GameSparksRT.logLevel.WARN = 2;
	GameSparksRT.logLevel.ERROR = 3;

	GameSparksRT.connectState = {};
	GameSparksRT.connectState.DISCONNECTED = 0;
	GameSparksRT.connectState.CONNECTING = 1;
	GameSparksRT.connectState.RELIABLE_ONLY = 2; 
	GameSparksRT.connectState.RELIABLE_AND_FAST_SEND = 3; 
	GameSparksRT.connectState.RELIABLE_AND_FAST = 4;

	GameSparksRT.deliveryIntent = {};
	GameSparksRT.deliveryIntent.RELIABLE = 0;
	GameSparksRT.deliveryIntent.UNRELIABLE = 1; 
	GameSparksRT.deliveryIntent.UNRELIABLE_SEQUENCED = 2;

	GameSparksRT.currLogLevel = GameSparksRT.logLevel.INFO;

	GameSparksRT.tagLevels = {};

	GameSparksRT.logger = function(msg) {
  		console.log(msg);
	}

	GameSparksRT.getSession = function(connectToken, hostName, tcpPort, listener) {
		return new RTSessionImpl(connectToken, hostName, tcpPort, listener);
	}

	GameSparksRT.setRootLogLevel = function(level) {
		GameSparksRT.currLogLevel = level;
	}

	GameSparksRT.setLogLevel = function(tag, level) {
	  	GameSparksRT.tagLevels[tag] = level;
	}

	GameSparksRT.shouldLog = function(tag, level) {
		for (var key in GameSparksRT.tagLevels) {
   			var value = GameSparksRT.tagLevels[key];

   			if (key == tag) {
	      		return value >= level;
	    	}
		}
	  
	  	return GameSparksRT.currLogLevel <= level;
	}

	GameSparksRT.prototype = {
	};

	return GameSparksRT;

}));
