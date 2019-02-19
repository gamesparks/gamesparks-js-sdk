var RTSessionImpl = function(connectToken, hostName, tcpPort, listener) {
	this.connectToken = connectToken;
 	this.tcpPort = tcpPort;
 	this.fastPort = tcpPort;
 	this.hostName = hostName;
	this.activePeers = [];
 	this.running = false;
 	this.ready = false;
	this.actionQueue = [];
	this.connectState = GameSparksRT.connectState.DISCONNECTED;
 	this.mustConnnectBy = (new Date()).getTime();
	this.reliableConnection = null;
	//this.fastConnection = null;
	this.sequenceNumber = 0;
	this.peerId = null;
	this.peerMaxSequenceNumbers = [];
 	this.listener = listener;
};

RTSessionImpl.prototype = {
	start: function() {
		this.running = true;
	},

	stop: function() {
		this.log("IRTSession", GameSparksRT.logLevel.DEBUG, "Stopped");

		this.running = false;
		this.ready = false;

		/*if (this.fastConnection) {
			this.fastConnection.stop();
		}*/

		if (this.reliableConnection) {
			this.reliableConnection.stop();
		}

		this.setConnectState(GameSparksRT.connectState.DISCONNECTED);
	},

	update: function() { 
		if (this.running) {
			this.checkConnection();
		}

		var toExecute = null;

		while (true) {
			toExecute = this.getNextAction();
			if (toExecute) {
				toExecute.execute();
			} else {
				break;
			}
		}
	},

	getNextAction: function() {
		if (this.actionQueue.length > 0) {            
			return this.actionQueue.shift();
		}

		return null;
	},

	submitAction: function(action) {      
		this.actionQueue.push(action);
	},

	checkConnection: function() {
		if (this.connectState == GameSparksRT.connectState.DISCONNECTED) {
			this.log("IRTSession", GameSparksRT.logLevel.INFO, "Disconnected, trying to connect");

			this.setConnectState(GameSparksRT.connectState.CONNECTING);

			this.connectReliable();
		} else if (this.connectState == GameSparksRT.connectState.CONNECTING && (new Date()).getTime() > this.mustConnnectBy) {
			this.setConnectState(GameSparksRT.connectState.DISCONNECTED);

			this.log("IRTSession", GameSparksRT.logLevel.INFO, "Not connected in time, retrying");

			if (this.reliableConnection) {
				this.reliableConnection.stopInternal();
				this.reliableConnection = null;
			}
			/*if (this.fastConnection) {
				this.fastConnection.stopInternal();
				this.fastConnection = null;
			}*/
		}
	},

	setConnectState: function(value) {
		if (value == GameSparksRT.connectState.RELIABLE_AND_FAST_SEND || value == GameSparksRT.connectState.RELIABLE_AND_FAST) {
			value = GameSparksRT.connectState.RELIABLE_ONLY;
		}

		if (value != this.connectState) {
			if (this.connectState < value || value == GameSparksRT.connectState.DISCONNECTED) {
				this.log("IRTSession", GameSparksRT.logLevel.DEBUG, "State Change : from " + this.connectState + " to " + value + ", ActivePeers " + this.activePeers.length);

				this.connectState = value;

				if (value == GameSparksRT.connectState.RELIABLE_ONLY) {
					this.onReady(true);
				}
			}
		}
	},

	connectFast: function() {
		/*this.log("IRTSession", GameSparksRT.logLevel.DEBUG, this.peerId + ": Creating new fastConnection to " + this.fastPort);

		this.fastConnection = new FastConnection(this);
		this.fastConnection.start(this.hostName, this.fastPort);*/
	},

	connectReliable: function() {
		this.mustConnnectBy = (new Date()).getTime() + GameSparksRT.TCP_CONNECT_TIMEOUT_SECONDS * 1000;
  
  		this.reliableConnection = new ReliableConnection(this.hostName, this.tcpPort, this);
  		this.reliableConnection.connect();
  	},

  	nextSequenceNumber: function() {
		var sequenceNumber = this.sequenceNumber;

		this.sequenceNumber = this.sequenceNumber + 1;

		return sequenceNumber;
	},

	shouldExecute: function(peerId, sequence) {
		if (sequence == null) {
			return true;
		} else if (this.peerMaxSequenceNumbers[peerId] == null) {
			this.peerMaxSequenceNumbers[peerId] = 0;
		}

		if (this.peerMaxSequenceNumbers[peerId] > sequence) {
			this.log("IRTSession", GameSparksRT.logLevel.DEBUG, "Discarding sequence id " + sequence + " from peer " + peerId.toString());

			return false;
		} else {
			this.peerMaxSequenceNumbers[peerId] = sequence;

			return true;
		}
	},

	resetSequenceForPeer: function(peerId) {
		if (this.peerMaxSequenceNumbers[peerId]) {
			this.peerMaxSequenceNumbers[peerId] = 0;
		}
	},

	onPlayerConnect: function(peerId) {
		this.resetSequenceForPeer(peerId);
		if (this.listener) {
			if (this.ready) {
				this.listener.onPlayerConnect(peerId);
			}
		}
	},

	onPlayerDisconnect: function(peerId) {
		if (this.listener) {
			if (this.ready) {
				this.listener.onPlayerDisconnect(peerId);
			}
		}
	},

	onReady: function(ready) {
		if (!this.ready && ready) {     
			this.sendData(OpCodes.PLAYER_READY_MESSAGE, GameSparksRT.deliveryIntent.RELIABLE, null, null);            
			if (this.peerId) {
				var ok = false;

				for (var k in this.activePeers) { 
					if (this.activePeers[k] == this.peerId) {
						ok = true;

						break;
					}
				}

				if (!ok) {
					this.activePeers.push(this.peerId);
				}
			}
		}

		this.ready = ready;

		if (!this.ready) {
			this.setConnectState(GameSparksRT.connectState.DISCONNECTED);
		}

		if (this.listener) {
			var myListener = this.listener;

			this.submitAction(ActionCommand.pool.pop().configure(function() {
				myListener.onReady(ready);
			}));
		}
	},

	onPacket: function(packet) {
		if (this.listener) {
			this.listener.onPacket(packet);
		} else {
			throw new Error("AccessViolationException");
		}
	},

	sendData: function(opCode, intent, payload, data, targetPlayers) {
		return this.sendRTDataAndBytes(opCode, intent, payload, data, targetPlayers);
	},

	sendRTData: function(opCode, intent, data, targetPlayers) {
	  	return this.sendRTDataAndBytes(opCode, intent, null, data, targetPlayers);
	},

	sendBytes: function(opCode, intent, payload, targetPlayers) {
	  	return this.sendRTDataAndBytes(opCode, intent, payload, null, targetPlayers);
	},

	sendRTDataAndBytes: function(opCode, intent, payload, data, targetPlayers) {
		var csr = PooledObjects.customRequestPool.pop();
		var ret;

		csr.configure(opCode, intent, payload, data, targetPlayers);
		/*if (intent != GameSparksRT.deliveryIntent.RELIABLE && this.connectState >= GameSparksRT.connectState.RELIABLE_AND_FAST_SEND) {
			ret = this.fastConnection.send(csr);

			PooledObjects.customRequestPool.push(csr);

			return ret;
		} else*/ if (this.connectState >= GameSparksRT.connectState.RELIABLE_ONLY) {
			ret = this.reliableConnection.send(csr);

			PooledObjects.customRequestPool.push(csr);

			return ret;
		}

		PooledObjects.customRequestPool.push(csr);

		return 0;
	},

	log: function(tag, level, msg) {
		if (GameSparksRT.shouldLog(tag, level)) {
			this.submitAction(LogCommand.pool.pop().configure(this, tag, level, msg));
		}
	}
};

