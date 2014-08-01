

var connector = (function() {
  var queue = [], sending = false, running = false, timer = null;

  var that = {
    start: function() {
      if (running) {
        return ;
      }
      running = true;
      timer = setInterval(function() {
        that.sendNext();
      }, 1000);
    },
    
    stop: function() {
      if (!running) {
        return ;
      }
      running = false;
      clearTimeout(timer);
    },
    
    isRunning: function() {
      return running === true;
    },
    
    length: function () {
      return queue.length;
    },

    isEmpty: function() {
      return queue.length === 0;
    },

    isSending: function() {
      return sending === true;
    },

    add: function(event, callback) {
      queue[queue.length] = {
        event: event,
        callback: callback,
      };
      this.sendNext();
    },

    sendNext: function() {
      if (!running || sending || this.isEmpty()) {
        return ;
      }

      sending = true;
      var data = queue[0];
      var string = JSON.stringify({ p: data.event });
      var self = this;

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", function() {
        queue.shift();

        sending = false;
        self.sendNext();
      }, true);

      xhr.addEventListener("error", function() {
        sending = false;
      });

      xhr.open("POST", Sample.getEndpoint());
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.setRequestHeader('Content-length', string.length);
      xhr.setRequestHeader('Connection', 'close');

      xhr.send(string);
    },
  };
  
  that.start();
  
  return that;

})();