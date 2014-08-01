/*!
 * Sample.js - Sends tracking events to 5d's analytics service. v0.0.1
 * http://www.5dlab.com
 *
 * Copyright (c) 2014-2014, Sascha Lange, João Alves
 * Licensed under the MIT License.
 *
 */



(function (window, undefined) {





var connector = (function() {
  var queue = [], sending = false, running = false, timer = null;

  var that = {
    start: function() {
      if (running) {
        return ;
      }
      running = true;
      timer = setTimeout(function() {
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

var endpoint     = "http://events.neurometry.com/sample/v01/event",
    installToken = null,
    appToken     = null,
    sessionToken = null,
    module       = null,
    debug        = false;
    
var mergeParams = function(userParams, eventName)
{
  var params = {};
  
  var add = function(key, value) {
    // we'll add "0" but ignore value that equals null
    if (key && typeof value !== "undefined" && (typeof value === "number" || value)) {
      params[key] = value;
    }
  };
  
  add("event_name",     eventName);
  add("app_token",      appToken);
  add("install_token",  installToken);
  add("session_token",  sessionToken);
  add("event_category", userParams.event_category);
  add("module",         userParams.module || module);
  add("debug",          debug);
  add("timestamp",      Math.round(new Date().getTime() /1000));
  
  return params;
};

var randomToken = function(length) {
  var str = "";
  
  for (var i=0; i < length; ++i) {
    if (i > 0 && i % 4 === 0) {
      str += "-";
    }
    str += Math.floor(16*Math.random()).toString(16).toUpperCase();
  }
  
  return str;
};

var Sample = {
  safariOnly: false,
  
  init: function(params) {
    if (localStorage.SampleToken) {
      installToken = localStorage.SampleToken;
    }
    else {
      localStorage.SampleToken = installToken = randomToken(24);
    }
    if (sessionStorage.SampleToken) {
      sessionToken = sessionStorage.SampleToken;
    }
    else {
      sessionStorage.SampleToken = sessionToken = randomToken(32);
    }
  },
  
  setEndpoint: function(newEndpoint) {
    endpoint = newEndpoint;
  },

  getEndpoint: function() {
    return endpoint;
  },

  setAppToken: function(newAppToken) {
    appToken = newAppToken;
  },
  
  setModule: function(newModule) {
    module = newModule;
  },
  
  setDebug: function(flag) {
    debug = flag;
  },

  track: function(eventName, params) {
    if (this.safariOnly === true && !this.isSafari()) {
      return ;
    }
    params = mergeParams(params || {}, eventName);
    connector.add(params, function() { });
  },
  
  sessionStart: function(newAppToken) {
    appToken = newAppToken || appToken;
    this.track('session_start', { event_category: 'session' });
  },
  
  sessionUpdate: function() {
    this.track('session_update', { event_category: 'session' });
  },
  
  ping: function() {
    this.track('ping', { event_category: 'session' });
  },
  
  isSafari: (function() {
    var memo = null;
    
    return function() {
      if (memo === null) {
        var ua = navigator.userAgent.toLowerCase(); 
        
        if (ua.indexOf('safari') != -1) { 
          if (ua.indexOf('chrome') > -1) {
            memo = false;
          } 
          else {
            memo = true;
          }
        }
        else {
          memo = false;
        }
      }
      return memo;
    };
  })()
};

Sample.init();	




window.Sample = Sample;
})(window);