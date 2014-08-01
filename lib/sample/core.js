
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



