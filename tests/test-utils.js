TestUtils = {};

TestUtils.generateGUID = function() {
	function s4() {
    	return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  	}
  	
  	return (s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4()).toUpperCase();
};

TestUtils.getSessions = function(sessionCount, apiKey, secret, rtServer, port, cluster, script, version) {
	var playerIds = [];

	for (var i = 0; i < sessionCount; i ++) {
		playerIds.push("gsplayerid" + (i + 1).toString());
	}

	var tokens = TestUtils.getToken(playerIds, apiKey, secret, rtServer + ":" + port, cluster, script, version);

	var sessions = [];

	for (var i = 0; i < playerIds.length; i ++) {
		console.log(tokens[i]);

		sessions.push(new TestSession(tokens[i], rtServer + ":" + port, port, playerIds[i]));
	}

	return sessions;
};

TestUtils.getToken = function(playerIds, apiKey, secret, rtServer, cluster, script, version) {
	var ret = [];
	var secondsSinceEpoch = Math.floor((new Date()).getTime());
	var matchId = TestUtils.generateGUID();

	for (var i = 0; i < playerIds.length; i ++) {
		var dict = {};

		dict["peerId"] = i + 1;
		dict["matchId"] = matchId;
		dict["ts"] = secondsSinceEpoch;
		dict["apiKey"] = apiKey;
		dict["playerId"] = playerIds[i];
		dict["rtServer"] = rtServer;
		dict["cluster"] = cluster;

		if (script != null) {
			dict["script"] = script;
		}
		if (version > 0) {
			dict["scriptVersion"] = version;
		}

		var encoded = JSON.stringify(dict);

		var jsonWithPipeSeparated = (i + 1).toString() + "|" + matchId.toString() + "|" + secondsSinceEpoch + "|" + encoded;
	
		encoded = TestUtils.encryptToken(jsonWithPipeSeparated, secret);
		ret.push(encoded);
	}

	return ret;
};

TestUtils.encryptToken = function(token, base64EncodedSecret) {
  	var secret = window.atob(base64EncodedSecret);
  	var tokenBytes;
  	var secretBytes = aesjs.utils.utf8.toBytes(secret);
  	var aes = new aesjs.AES(secretBytes);
  	var encryptedBytes;
  	var encryptedToken = "";
  	var numZerosToAdd;

  	numZerosToAdd = token.length % 16;
  	if (numZerosToAdd != 0) {
  		for (var i = 16; i > numZerosToAdd; i --) {
  			token = token + String.fromCharCode(16 - numZerosToAdd);
  		}
  	}
  	
  	for (var i = 0; i < Math.floor(token.length / 16); i ++) {
  		tokenBytes = aesjs.utils.utf8.toBytes(token.slice(i * 16, (i + 1) * 16));
  		encryptedBytes = aes.encrypt(tokenBytes);
  		for (var a = 0; a < encryptedBytes.length; a ++) {
  			encryptedToken = encryptedToken + String.fromCharCode(encryptedBytes[a]);
  		}
  	}
  	
  	return window.btoa(encryptedToken);
};

TestUtils.contains = function(array, item) {
	for (var key in array) {
		if (array[key] === item) { 
			return true;
		}
	}

	return false;
};

TestUtils.remove = function(array, item) {
	for (var key in array) {
		if (array[key] === item) { 
			delete array[key];

			return;
		}
	}
}

TestUtils.round = function(num, numDecimalPlaces) {
	var mult = Math.pow(10, (numDecimalPlaces | 0));
  
	return Math.floor(num * mult + 0.5) / mult;
}
