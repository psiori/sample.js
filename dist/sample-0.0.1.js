/*!
 * Sample.js - Sends tracking events to 5d's analytics service. v0.0.1
 * http://www.5dlab.com
 *
 * Copyright (c) 2014-2014, Sascha Lange, João Alves
 * Licensed under the MIT License.
 *
 */



(function (window, undefined) {

var XHRPost = (function() 
{
  var that = {
    
    send: function(url, data, onSuccess, onFailure) 
    {
      var string = JSON.stringify(data);
      var self = this;

      var xhr = new XMLHttpRequest();
      xhr.addEventListener("load", function() 
      {
         if (onSuccess) {
           onSuccess();
         }
      }, true);

      xhr.addEventListener("error", function() 
      {
        if (onFailure) {
          onFailure();
        }
      });

      xhr.open("POST", url);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
      xhr.setRequestHeader('Content-length', string.length);
      xhr.setRequestHeader('Connection', 'close');

      xhr.send(string);
    }
  };
  
  return that;
  
})();



var isArray = function(arg)
{
  if (typeof Array.isArray === 'undefined') 
  {
    return Array.isArray(arg);
  }
  else
  {
    return Object.prototype.toString.call(arg) === '[object Array]';
  } 
};

var encodePair = function(key, value, prefix)
{
  return prefix + "[" + key + "]=" + encodeURIComponent(value);
};

var encodeHash = function(hash, name)
{
  var components = [];
  
  for (var key in hash) 
  {
    if (hash.hasOwnProperty(key)) 
    {
      components[components.length] = encodePair(key, hash[key], name);
    }
  }
  return components;
};

var encodeArray = function(array, name)
{
  var components = [];
  
  for (var i=0; i < array.length; i++)
  {
    components[components.length] = encodeHash(array[i], name + "[" + i + "]").join("&");
  }
  return components;
};


var Pixel = (function() {
  
  var counter = 9900;
  
  var insertElement = function(iframe, url, callback)
  {
    var body    = document.getElementsByTagName("body")[0];
    var element = document.createElement(iframe ? 'iframe' : 'img');
    var key     = "sample-key-" + counter++;
    
    element.src = url;
    element.id = key;
    element.style.width = iframe ? "1px" : "0";
    element.style.height = iframe ? "1px" : "0";
    element.style.border = "0";
    element.style.margin = "0";
    element.style.padding = "0";
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    
    setTimeout(function() {
      body.removeChild(element);
      if (callback)
      {
        callback();
      }
    }, 500);
    
    body.insertBefore(element, body.childNodes[0]);
  };
  
  var that = {
    
    useIFrame: false,
    
    send: function(url, data, onSuccess, onFailure) 
    {
      var str = "";
      
      if (isArray(data.p)) 
      {
        str = encodeArray(data.p, 'p').join("&");
      }
      else if (typeof data.p === "object")
      {
        str = encodeHash(data.p, 'p').join("&");
      }
      
      if (url.indexOf("?") === -1) 
      {
        url += "?" + str;
      }
      else 
      {
        url += "&" + str;
      }
      
      insertElement(this.useIFrame, url, onSuccess);
    }
  };
  
  return that;
})();

var createGroup = function() {
  return {
    callback: function() {},
    events: []
  };
};


var connector = (function() {
  var queue = [], group = createGroup(),
      sending = false, running = false, timer = null, grouping = false;

  var that = {
    
    useXHR: true,
    
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
    
    setRequestMethod: function(method)
    {
      this.useXHR = method === "xhr";
      if (!this.useXHR)
      {
        Pixel.useIFrame = method === "iframe";
      }
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
    
    startGroup: function() {
      grouping = true;
    },
    
    endGroup: function() {
      var tmp = group;
      grouping = false;

      if (group.events.length === 0) {
        return ;
      }
      
      group = createGroup();
      this.add(tmp.events, tmp.callback);
    },
    
    isGroup: function() {
      return grouping;
    },

    add: function(event, callback) {
      if (grouping) {
        if (callback) {
          var gc = group.callback;
          group.callback = function() {
            callback.apply(this, arguments);
            gc.apply(this, arguments);
          };
        }
        group.events[group.events.length] = event;
      }
      else {
        queue[queue.length] = {
          event: event,
          callback: callback
        };
        this.sendNext();
      }
    },

    sendNext: function() {
      if (!running || sending || this.isEmpty()) {
        return ;
      }

      sending = true;
      var data = queue[0];
      var string = JSON.stringify({ p: data.event });
      var self = this;
      
      var url = Sample.getEndpoint();
      var payload = { p: data.event };
      var success = function() {
        queue.shift();
        
        sending = false;
        self.sendNext();
      };
      var error = function() {
        sending = false;
      };
      
      if (this.useXHR) {
        XHRPost.send(url, payload, success, error);
      }
      else {
        Pixel.send(url, payload, success, error);
      }
    }
  };
  
  that.start();
  
  return that;

})();
var chooseProtocol = function()
{
  var protocol = (location.protocol || "https:");
  if (protocol !== "http:" && protocol !=="https:")
  {
    protocol = "https:";
  }
  return protocol;
};

var endpoint     = "http:" + /*chooseProtocol() +*/ "//events.neurometry.com/sample/v01/event",
    installToken = null,
    appToken     = null,
    sessionToken = null,
    module       = null,
    userId       = null,
    email        = null,
    platform     = null,
    autoping     = null;
    debug        = false;
    
var mergeParams = function(userParams, eventName)
{
  var params = {};
  
  var add = function(key, value) 
  {
    // we'll add "0" but ignore value that equals null
    if (key && typeof value !== "undefined" && (typeof value === "number" || value)) 
    {
      params[key] = value;
    }
  };
  
  add("event_name",     eventName);
  add("app_token",      appToken);
  add("install_token",  installToken);
  add("session_token",  sessionToken);
  add("debug",          debug);
  add("timestamp",      Math.round(new Date().getTime() /1000));
  add("user_id",        userId);

  add("event_category", userParams.event_category);
  add("module",         userParams.module || module);
  add("content_id",     userParams.content_id);
  add("content_ids",    userParams.content_ids);
  add("content_type",   userParams.content_type);
  
  if (eventName === "sessionStart" ||
      eventName === "sessionUpdate") 
  {
    add("email",        userParams.email || email);
    add("platform",     userParams.platform || platform);
  }
  
  return params;
};

var randomToken = function(length) 
{
  var str = "";
  
  for (var i=0; i < length; ++i) 
  {
    if (i > 0 && i % 4 === 0) 
    {
      str += "-";
    }
    str += Math.floor(16*Math.random()).toString(16).toUpperCase();
  }
  
  return str;
};

var Sample = 
{
  PLATFORM_BROWSER:  'browser',
  PLATFORM_IOS:      'ios',
  PLATFORM_ANDROID:  'android',
  PLATFORM_WINDOWS:  'windows',
  PLATFORM_FACEBOOK: 'facebook',
  
  init: function(params) 
  {
    if (localStorage.getItem('SampleToken')) 
    {
      installToken = localStorage.getItem('SampleToken');
    }
    else 
    {
      localStorage.setItem('SampleToken', (installToken = randomToken(24)));
    }
    if (sessionStorage.getItem('SampleToken')) 
    {
      sessionToken = sessionStorage.getItem('SampleToken');
    }
    else 
    {
      sessionStorage.setItem('SampleToken', (sessionToken = randomToken(32)));
    }
    platform = this.PLATFORM_BROWSER;
    connector.setRequestMethod(this.isWebkit() ? "xhr" : "iframe");
  },
  
  stop: function() 
  {
    connector.stop();
  },
  
  resume: function() 
  {
    connector.start();
  },
  
  setEndpoint: function(newEndpoint) 
  {
    endpoint = newEndpoint;
  },

  getEndpoint: function() 
  {
    return endpoint;
  },

  /** sets the method being used to communicate with the event server.
    * request methods to choose from: xhr (recommended), img (legacy,
    * works across different origins), iframe (legacy with same origin) 
    */
  setRequestMethod: function(method) 
  {
    connector.setRequestMethod(method);
  },

  setAppToken: function(newAppToken) 
  {
    appToken = newAppToken;
  },
  
  setModule: function(newModule) 
  {
    module = newModule;
  },
  
  setPlatform: function(newPlatform) 
  {
    platform = newPlatform;
  },
  
  setUserId: function(newUserId) 
  {
    userId = newUserId;
  },
  
  setEmail: function(newEmail) 
  {
    email = newEmail;
  },
  
  setDebug: function(flag) 
  {
    debug = flag;
  },
  
  startGroup: function() 
  {
    connector.startGroup();
  },
  
  endGroup: function() 
  {
    connector.endGroup();
  },

  track: function(eventName, params) 
  {
    params = mergeParams(params || {}, eventName);
    connector.add(params, function() { });
  },
  
  sessionStart: function(newAppToken) 
  {
    appToken = newAppToken || appToken;
    this.track('session_start', { event_category: 'session' });
  },
  
  sessionUpdate: function() 
  {
    this.track('session_update', { event_category: 'session' });
  },
  
  ping: function() 
  {
    this.track('ping', { event_category: 'session' });
  },
  
  /** starts or stops autopinging every seconds seconds.
   * pass seconds = 0 to stop pinging. */
  autoPing: function(seconds) 
  {
    var that = this;
    if (typeof seconds === "undefined") 
    {
      seconds = 60;
    }
    clearTimeout(autoping);
    autoping = null;
    if (seconds && seconds > 0) 
    {
      autoping = setInterval(function() {
        that.ping();
      }, seconds * 1000);
    }
  },
  
  contentUsage: function(content_ids, content_type) 
  {
    content_type = content_type || 'content';
    var args = { 
      content_type: content_type,
      event_category: 'content'
    };
    if (Array.isArray(content_ids)) 
    {
      args.content_ids = content_ids;
    }
    else 
    {
      args.content_id = content_ids;      
    }
    this.track('usage', args);
  },
  
  isWebkit: (function() 
  {
    var memo = null;
    
    return function() 
    {
      if (memo === null) 
      {
        var ua = navigator.userAgent.toLowerCase(); 
        memo = ua.indexOf('safari') !== -1 || ua.indexOf('chrome') !== -1; 
      }
      return memo;
    };
  })()
};

Sample.init();	




window.Sample = Sample;
})(window);