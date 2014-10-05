/*!
 * Sample.js - Sends tracking events to 5d's analytics service. v0.0.2
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

      xhr.send(string);
    }
  };
  
  return that;
  
})();



var isArray = function(arg)
{
  if (typeof Array.isArray !== 'undefined') 
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
  
  var counter   = 9900;
  var wrapperId = 'sample-js-iframes';
  
  var insertElement = function(url, callback)
  {
    var hook   = document.getElementById(wrapperId);
    
    if (!hook)
    {
      var body = document.getElementsByTagName("body")[0];
      hook = document.createElement('div');
      hook.id = wrapperId;
      hook.style.display = 'none'; 
      hook.style.width   = "0";
      hook.style.height  = "0";
      hook.style.margin  = "0";
      body.insertBefore(hook, body.childNodes[0]);
    } 
    
    var element = document.createElement('iframe');
    var key     = "sample-key-" + counter++;
    
    function handler() 
    { 
      if (callback)
      {
        callback();
      }      
      hook.removeChild(element);      
    }
    
    element.onload  = handler;
    element.onerror = handler;
    
    element.src = url;
    element.id = key;
    element.style.position = "fixed";
    element.style.width    = "1px";
    element.style.height   = "1px";
    element.style.border   = "0";
    element.style.margin   = "0";
    element.style.padding  = "0";
    element.style.left     = "0";
    element.style.top      = "0";
    
    hook.appendChild(element);
  };
  
  var that = {
        
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
      
      insertElement(url, onSuccess);
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
    protocol = "http:";
  }
  return protocol;
};

var endpoint       = chooseProtocol() + "//events.psiori.com/sample/v01/event",
    sdk            = "Sample.JS",
    sdk_version    = "0.0.2",
    installToken   = null,
    appToken       = null,
    sessionToken   = null,
    module         = null,
    userId         = null,
    email          = null,
    platform       = null,
    client         = null,
    client_version = null,
    longitude      = null,
    latitude       = null,
    ad_referer     = null,
    ad_campaign    = null,
    ad_placement   = null,
    locale         = null,
    autoping       = null,
    host           = null,
    browserMode    = true,
    debug          = false;
    
var mergeParams = function(userParams, eventName, eventCategory)
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

  add("sdk",            sdk);
  add("sdk_event",      sdk_version);
  
  add("platform",       userParams.platform       || platform);
  add("client",         userParams.client         || client);
  add("client_version", userParams.client_version || client_version);
  
  add("event_name",     eventName);
  add("app_token",      appToken);
  add("install_token",  installToken);
  add("session_token",  sessionToken);
  add("debug",          debug);
  add("timestamp",      Math.round(new Date().getTime() /1000));
  add("user_id",        userId);

  add("event_category", eventCategory || "custom");
  add("module",         userParams.module || module);
  add("content_id",     userParams.content_id);
  add("content_ids",    userParams.content_ids);
  add("content_type",   userParams.content_type);
  
  add("parameter1",     userParams.parameter1);
  add("parameter2",     userParams.parameter2);
  add("parameter3",     userParams.parameter3);
  add("parameter4",     userParams.parameter4);
  add("parameter5",     userParams.parameter5);
  add("parameter6",     userParams.parameter6);
  
  if (eventName === "purchase" ||
      eventName === "chargeback")
  {
    add("provider",     userParams.provider);
    add("gross",        userParams.gross);
    add("currency",     userParams.currency);
    add("country",      userParams.country);
    add("earnings",     userParams.earnings);
    add("product_sku",  userParams.product_sku);
    add("product_category", userParams.product_category);
    add("receipt_identifier", userParams.receipt_identifier);
  }

  
  if (eventName === "session_start" ||
      eventName === "session_update" ||
      (eventCategory && eventCategory === "account")) 
  {
    add("email",         userParams.email     || email);
    add("locale",        userParams.locale    || locale);
    
    add("ad_referer",    userParams.ad_referer   || ad_referer);
    add("ad_campaign",   userParams.ad_campaign  || ad_campaign);
    add("ad_placement",  userParams.ad_placement || ad_placement);
    
    add("longitute",     userParams.longitude || longitude);
    add("latitude",      userParams.latitude  || latitude);
    
    
    if (browserMode)
    {
      add("http_referrer", document.referrer);
      add("http_request", window.location.href);
    }
    
    // send host only, if explicitly set or presently in browser mode
    add("host", host || (browserMode ? window.location.host : null));
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
  
  setClient: function(clientId) 
  {
    client = clientId;
  },
  
  setClientVersion: function(newClientVersion) 
  {
    client_version = newClientVersion;
  },
  
  setUserId: function(newUserId) 
  {
    userId = newUserId;
  },
  
  setFacebookId: function(newFacebookId)
  {
    facebookId = newFacebookId;
  },
  
  setEmail: function(newEmail) 
  {
    email = newEmail;
  },
  
  setLocation: function(newLongitude, newLatitude)
  {
    longitude = newLogitude;
    latitude = newLatitude;
  },
  
  setLocale: function(newLocale)
  {
    locale = newLocale;
  },
  
  setReferer: function(referer, campaign, placement)
  {
    ad_referer = referer || null;
    ad_campaign = campaign || null;
    ad_placement = placement || null;
  },
  
  setDebug: function(flag) 
  {
    debug = flag;
  },
  
  setBrowserMode: function(flag)
  {
    inBrowser = !!flag;
  },
  
  setHost : function(hostname)
  {
    host = hostname;
  },
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   EVENT GROUPING
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** start an event group. All tracking events created between startGroup()
    * and endGroup() will be grouped together and send in one single HTTP
    * packet right after the closing call to endGroup(). */
  startGroup: function() 
  {
    connector.startGroup();
  },
  
  /** closes an event group and sends all grouped events in one HTTP packet
    * to the server. */
  endGroup: function() 
  {
    connector.endGroup();
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   GENERIC TRACKING EVENT
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** generic tracking event that could be used to send pre-defined tracking
    * events as well as user-defined, custom events. Just pass the eventName,
    * the eventCategory (used for grouping in reports of the backend) and
    * an optional hash of parameters. 
    *
    * Please note that only known parameters will be passed to the server.
    * If you want to come up with your own parameters in you custom events,
    * use the six pre-defined fields "parameter1" to "parameter6" for this
    * purpose. 
    *
    * Examples:
    * Sample.track('session_start', 'session'); // send the session start event
    * Sample.track('found_item', 'custom', {    // send custom item event
    *   parameter1: 'Black Stab',               // custom item name
    *   parameter2: '21',                       // level of item
    * });
    */
  track: function(eventName, eventCategory, params) 
  {
    params = mergeParams(params || {}, eventName, eventCategory);
    connector.add(params, function() { });
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   SESSION EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** should be send on the start of a new session. */
  sessionStart: function(newAppToken, newUserId, params)
  {
    appToken = newAppToken || appToken;
    userId = newUserId || userId;
    this.track('session_start', 'session', params);
  },
  
  sessionUpdate: function(params)
  {
    this.track('session_update', 'session', params);
  },
  
  sessionPause: function()
  {
    this.track('session_pause', 'session');
  },
  
  sessionResume: function()
  {
    this.track('session_resume', 'session');
  },
  
  ping: function() 
  {
    this.track('ping', 'session');
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
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   ACCOUNT EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  registration: function(newUserId, params)
  {
    userId = newUserId || userId;
    this.track('registration', 'account', params);
  },
  
  signIn: function(newUserId, params)
  {
    userId = newUserId || userId;
    this.track('sign_in', 'account', params);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   CONTENT EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  contentUsage: function(content_ids, content_type) 
  {
    content_type = content_type || 'content';
    var args = { 
      content_type: content_type
    };
    if (Array.isArray(content_ids)) 
    {
      args.content_ids = content_ids;
    }
    else 
    {
      args.content_id = content_ids;      
    }
    this.track('usage', 'content', args);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   PROGRESSION EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   PURCHASE EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  purchase: function(product_id, params)
  {
    var userParams = params || {};
    userParams.product_sku = product_id;
    this.track('purchase', 'revenue', userParams);
  },
  
  chargeback: function(product_id, params)
  {
    var userParams = params || {};
    userParams.product_sku = product_id;
    this.track('chargeback', 'revenue', userParams);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   VIRTUAL CURRENCY EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  
  
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
  })(),
  
  isIE: (function() 
  {
    var memo = null;
    
    return function() 
    {
      if (memo === null) 
      {
        var ua = navigator.userAgent; 
        memo = (ua.indexOf('MSIE') !== -1 || ua.indexOf('Trident/') > 0);
      }
      return memo;
    };
  })()
};

Sample.init();	




window.Sample = Sample;
})(window);