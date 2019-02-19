var ActionCommand = function() {
    this.action = null;
};

ActionCommand.pool = new ObjectPool(function() {
  return new ActionCommand();
}, null, 5);

ActionCommand.prototype = {
    configure: function(action) {
        this.action = action;

        return this;
    },

    execute: function() {
        this.action();
        ActionCommand.pool.push(this);
    }
};