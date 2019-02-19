var TestConfig = function() {
	this.finished = false;
};

TestConfig.apiKey = "exampleKey12";
TestConfig.secret = "exampleSecret1234567890123456789";
TestConfig.rtServer = "gst-aeu-rt-34-244-168-32.gamesparks.net";
TestConfig.cluster = "gst-aeu000";
TestConfig.port = 5000;
TestConfig.version = 1560375279;

TestConfig.prototype = {
	start: function() {
		console.log("##############################################");
  		console.log("### TestConfig");
  		console.log("##############################################");
	
  		var xmlhttp;
  		var myThis = this;

		if (window.XMLHttpRequest && navigator.userAgent.toLowerCase().indexOf('firefox') < 0) {
		    xmlhttp = new XMLHttpRequest();

		    xmlhttp.open("GET", "https://cpqs3g3fc0.execute-api.eu-west-1.amazonaws.com/dev/clusters/gst-aeu-rt/resources?stage=preview", true);
		    xmlhttp.setRequestHeader("x-api-key", "exampleApiGatewayKey12345678901234567890");

		    xmlhttp.onload = function() {
				if (xmlhttp.readyState === 4) {
					if (xmlhttp.status === 200) {
						console.log(xmlhttp.responseText);

					    var t = JSON.parse(xmlhttp.responseText);
					    var jar = t.resources;
					    var first = jar[0];
					    var index = first.indexOf(":");

					    if (index >= 0) {
					    	TestConfig.rtServer = first.slice(0, index) + ".gamesparks.net";
					    	TestConfig.port = parseInt(first.slice(index + 1));

					    	console.log("RTServer: " + TestConfig.rtServer + "   Port: " + TestConfig.port);

					    	console.log("PASSED!");

					    	myThis.finished = true;
					    }
					} else {
						console.error(xmlhttp.statusText);
					}
				}
			};

			xmlhttp.onerror = function() {
				console.error(xmlhttp.statusText);
			};

			xmlhttp.send(null);
		} else {
			myThis.finished = true;
		}
	}
};
