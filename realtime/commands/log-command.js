var LogCommand = function() {
    this.tag = null;
    this.msg = null;
    this.level = null;
    this.session = null;
};

LogCommand.pool = new ObjectPool(function() {
  return new LogCommand();
}, null, 5);

LogCommand.prototype = {
    configure: function(session, tag, level, msg) {
        this.tag = tag;
        this.msg = msg;
        this.level = level;
        this.session = session;

        return this;
    },

    execute: function() {
        if (GameSparksRT.shouldLog(this.tag, this.level)) {
            if (this.session.peerId) {
                GameSparksRT.logger(this.session.peerId + " " + this.tag + ":" + this.msg);
            } else {
                GameSparksRT.logger(" " + this.tag + ":" + this.msg);
            }
        }

        LogCommand.pool.push(this);
    }
};





