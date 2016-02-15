/*!
 * Sample.js - Sends tracking events to 5d's analytics service. v0.0.5
 * http://www.5dlab.com
 *
 * Copyright (c) 2014-2015, Sascha Lange, João Alves, Daniel Band, Artur Susdorf
 * Licensed under the MIT License.
 *
 */



(function (window, undefined) {//
// Contains helper functions that will be hidden in the library's closure.
//

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

var isOnline = function()
{
  return navigator.userAgent.match(/PhantomJS/) || navigator.onLine;
};


var XHRPost = (function() 
{
  var failuref = function(evt, xhr, url, handler) {
    if (handler) 
    {
      var request = {
        status: xhr.status,
        headers: xhr.getResponseHeader,
        url: url
      };
      var payload = {};
      
      try {
          payload = JSON.parse(xhr.responseText);
      } catch (e) {}
      
      handler(payload, request);
    }
  };

  var successf = function(evt, xhr, url, handler) {
    if (handler) 
    {
      var request = {
        status: xhr.status,
        headers: xhr.getResponseHeader,
        url: url
      };
      var payload = {};
      
      try {
          payload = JSON.parse(xhr.responseText);
      } catch (e) {}           
      
      handler(payload, request);
    }
  };

  var that = {

    send: function(url, data, onSuccess, onFailure) 
    {
      var string = JSON.stringify(data);
      var self = this;
      
      var xhr = new XMLHttpRequest();
      
      xhr.addEventListener("load", function(evt) {
        if (xhr.status !== 200 && xhr.status !== 201) {
          failuref(evt, xhr, url, onFailure);
        }
        else {
          successf(evt, xhr, url, onSuccess);
        }
      }, true);
      
      xhr.addEventListener("error", function(evt) {
        failuref(evt, xhr, url, onFailure);
      });
      
      xhr.open("POST", url);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

      xhr.send(string);
    }
  };
  
  return that;
  
})();


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
      sending = false, running = false, timer = null, grouping = false, 
      timeout=500, maxTimeout=60000, failureCount=0;

  var that = {
    
    useXHR: true,
    
    start: function() {
      if (running) {
        return ;
      }
      running = true;
      timer = setInterval(function() {
        that.sendNext();
      }, 5000);
    },
    
    stop: function() {
      if (!running) {
        return ;
      }
      running = false;
      clearInterval(timer);
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
      this.add(tmp.url, tmp.events, tmp.callback);
    },
    
    isGroup: function() {
      return grouping;
    },

    add: function(url, event, callback) {
      if (grouping) {
        if (callback) {
          var gc = group.callback;
          group.callback = function() {
            callback.apply(this, arguments);
            gc.apply(this, arguments);
          };
        }
        group.events[group.events.length] = event;
        group.url = url; // last url will win
      }
      else {
        queue[queue.length] = {
          event: event,
          callback: callback,
          url: url
        };
        this.sendNext();
      }
    },

    clear: function() {
      queue = [];
    },

    sendNext: function() {
      if (!running || !isOnline() || sending || this.isEmpty()) {
        return ;
      }

      sending = true;
      var data = queue[0];
      var self = this;
      
      var url = data.url;
      var payload = { p: data.event };
      
      var success = function(payload, request) 
      {
        queue.shift();
        failureCount = 0;
        
        sending = false;
        self.sendNext();
        if (typeof data.callback === "function")
        {
          data.callback.call(data.callback, payload, request);
        }
      };
      
      var error = function(payload, request) 
      {
        sending = false;
        failureCount += 1;
        
        if (request.status === 400 || request.status === 500)
        {
          queue.shift();
          self.sendNext();
          
          if (typeof data.callback === "function")
          {
            data.callback.call(data.callback, payload, request);
          }
        }
        else 
        {
          setTimeout(function() {
            self.sendNext();
          }, Math.min(timeout * failureCount, maxTimeout));
        }
      };
      
      if (this.useXHR) {
        XHRPost.send(url, payload, success, error);
      }
      else {
        Pixel.send(url, payload, success, error);
      }
    }
  };
  
  document.addEventListener("online", function() {
    that.sendNext();
  });
  document.addEventListener("offline", function() {
    // presently nothing to do on going offline.
  });
  
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

var endpoint       = chooseProtocol() + "//events1.psiori.com/sample/v01/event",
    sdk            = "Sample.JS",
    sdk_version    = "0.0.5",
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
    facebook_id    = null,
    country_code   = null,
    present_page_id= null,
    timestamp      = null, 
    browserMode    = true,
    debugMode      = false,
    forceDate      = false,
    acc_value      = 1;
    
    
var getItemInStorage = function(key, storage)
{
  storage = storage || "sessionStorage";
  
  try // safari on private settings (do not allow websites to store local data)   
  {   // throws a security exception already when trying to get the typeof.
    if (typeof window[storage] !== "undefined")
    {
      return window[storage].getItem(key);
    }
  } 
  catch (e) 
  {}
  
  return null;
};

var setItemInStorage = function(key, value, storage)
{
  storage = storage || "sessionStorage"; // default is sessionStorage
  
  try // safari on private settings (do not allow websites to store local data)   
  {   // throws a security exception already when trying to get the typeof.
    if (typeof window[storage] !== "undefined")
    {
      window[storage].setItem(key, value);
      return window[storage].getItem(key);
    }
  } 
  catch (e) 
  {}
  
  return null;
};

var removeItemInStorage = function(key, storage)
{
  storage = storage || "sessionStorage"; // default is sessionStorage
  
  try // safari on private settings (do not allow websites to store local data)   
  {   // throws a security exception already when trying to get the typeof.
    if (typeof window[storage] !== "undefined")
    {
      window[storage].removeItem(key);
    }
  } 
  catch (e) 
  {}
  
  return null;
};

var setPageId = function(page_id) 
{
  present_page_id = page_id;
  return setItemInStorage('page_id', page_id);
};

var getPageId = function() 
{
  return getItemInStorage('page_id') || present_page_id || null;
};

var clearPageId = function() 
{
  present_page_id = null;
  removeItemInStorage('page_id');
};

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
  add("sdk_version",    sdk_version);
  
  add("platform",       userParams.platform       || platform);
  add("client",         userParams.client         || client);
  add("client_version", userParams.client_version || client_version);
  
  add("event_name",     eventName);
  add("app_token",      appToken);
  add("install_token",  installToken);
  add("session_token",  sessionToken);
  add("debug",          debugMode);
  add("force_date",     forceDate);
  add("timestamp",      userParams.timestamp || timestamp || Math.round(new Date().getTime() /1000));
  add("user_id",        userId);

  add("event_category", eventCategory || "custom");
  add("module",         userParams.module || module);
  add("content_id",     userParams.content_id);
  add("content_ids",    userParams.content_ids);
  add("content_type",   userParams.content_type);
  add("page_id",        userParams.page_id || getPageId());
  add("translation",    userParams.translation);
  
  add("parameter1",     userParams.parameter1);
  add("parameter2",     userParams.parameter2);
  add("parameter3",     userParams.parameter3);
  add("parameter4",     userParams.parameter4);
  add("parameter5",     userParams.parameter5);
  add("parameter6",     userParams.parameter6);

  add("callback",       userParams.callback);
  add("automatic",      userParams.automatic);
  
  if (eventName === "purchase" ||
      eventName === "chargeback")
  {
    add("pur_provider",           userParams.pur_provider);
    add("pur_gross",              userParams.pur_gross);
    add("pur_currency",           userParams.pur_currency);
    add("pur_country_code",       userParams.pur_country_code);
    add("pur_earnings",           userParams.pur_earnings);
    add("pur_product_sku",        userParams.pur_product_sku);
    add("pur_product_category",   userParams.pur_product_category);
    add("pur_receipt_identifier", userParams.pur_receipt_identifier);
  }
  
  if (eventName === "session_start"  ||
      eventName === "session_update" ||
      eventName === "session_resume" ||
      (eventCategory && eventCategory === "account")) 
  {
    add("email",         userParams.email     || email);
    add("locale",        userParams.locale    || locale);
    
    add("ad_referer",    userParams.ad_referer   || ad_referer);
    add("ad_campaign",   userParams.ad_campaign  || ad_campaign);
    add("ad_placement",  userParams.ad_placement || ad_placement);
    
    add("longitute",     userParams.longitude || longitude);
    add("latitude",      userParams.latitude  || latitude);

    add("country_code",  userParams.country_code  || country_code);
    add("facebook_id",   userParams.facebook_id   || facebook_id);
    
    add("target_group",  userParams.target_group);
    
    if (browserMode)
    {
      add("http_referrer", document.referrer);
      add("http_request", window.location.href);
    }
    
    // send host only, if explicitly set or presently in browser mode
    add("host", host || (browserMode ? window.location.host : null));
  }
  if (eventCategory === "custom")
  {
    add("acc_value", userParams.acc_value || acc_value);
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
    if (!(installToken = getItemInStorage('SampleToken', 'localStorage')))
    {
      setItemInStorage('SampleToken', (installToken = randomToken(24)), 'localStorage');
    }

    if (!(sessionToken = getItemInStorage('SampleToken', 'sessionStorage')))
    {
      setItemInStorage('SampleToken', (sessionToken = randomToken(32)), 'sessionStorage');
    }

    platform = this.PLATFORM_BROWSER;
    connector.setRequestMethod("xhr");
  },
  
  /** Stops the tracking of user events */
  stop: function() 
  {
    connector.stop();
  },
  
  /** Resumes the tracking of user events */
  resume: function() 
  {
    connector.start();
  },
  
  /** Sets the endpoint.
    * The endpoint specifies the location where the events will be send to
    */
  setEndpoint: function(newEndpoint) 
  {
    endpoint = newEndpoint;
  },

  /** Returns the endpoint */
  getEndpoint: function() 
  {
    return endpoint;
  },

  /** Sets the method being used to communicate with the event server.
    * request methods to choose from: xhr (recommended), img (legacy,
    * works across different origins), iframe (legacy with same origin) 
    */
  setRequestMethod: function(method) 
  {
    connector.setRequestMethod(method);
  },

  /** Sets the app token.
    * Remember that it should be unique across all your apps
    */
  setAppToken: function(newAppToken) 
  {
    appToken = newAppToken;
  },
  
  /** Sets the module.
    * Probably you want to separate your app into parts for better event
    * evaluation
    */
  setModule: function(newModule) 
  {
    module = newModule;
  },
  
  /** Sets the plattform
    * E.g. iOS, android
    */
  setPlatform: function(newPlatform) 
  {
    platform = newPlatform;
  },
  

  /** Returns the current platform
    */
  getPlatform: function()
  {
    return platform;
  },

  /** Sets the client id */
  setClient: function(clientId) 
  {
    client = clientId;
  },
  
  /** Sets the clients version */
  setClientVersion: function(newClientVersion) 
  {
    client_version = newClientVersion;
  },
  
  /** Sets the user id of the current user */
  setUserId: function(newUserId) 
  {
    userId = newUserId;
  },
  
  /** Sets the facebook id of the current facebook user */
  setFacebookId: function(newFacebookId)
  {
    facebook_id = newFacebookId;
  },
  
  /** Sets the email of the current user
    */
  setEmail: function(newEmail) 
  {
    email = newEmail;
  },
  
  /** Sets the users location in form of latitude and longitude
    */
  setLocation: function(newLongitude, newLatitude)
  {
    longitude = newLogitude;
    latitude = newLatitude;
  },
  
  /** Sets the local
    * E.g. DE, EN
    */
  setLocale: function(newLocale)
  {
    locale = newLocale;
  },
  
  /** Sets the ad referrer, campaign and placement for all events
    */
  setReferer: function(referer, campaign, placement)
  {
    ad_referer = referer || null;
    ad_campaign = campaign || null;
    ad_placement = placement || null;
  },
  
  /** Enable debug mode if the event should not be considered in evaluations
    */
  setDebug: function(flag) 
  {
    debugMode = flag;
  },
  
  /** Forces Psiori to use the client date although it's unreliable
    */
  setForceDate: function(flag) 
  {
    forceDate = flag;
  },
  
  /** Usually, the tracking SDK uses now as the timestamp, but
    * with this method Sample.JS can be forced to send any 
    * arbitrary event creation date to the server. Usually
    * you'd use it in combination with setForceDate(true) to
    * force the PSIORI server to use your date instead of
    * the date the event came in. Please note, that the
    * given date will be used for all subsequent events
    * until you either set a different timestamp OR set
    * it back to null with Sample.setTimestamp(null) what
    * will cause the SDK to use NOW again.
    *
    * Alternatively, you can pass-in a timestamp with the
    * user parameters of a tracking event.
    */
  setTimestamp: function(date) 
  {
    timestamp = date ? Math.round(date.getTime() /1000) : null;
  },
  
  /** sets the browser mode
    * Indicates whether or not the application runs in a browser. If browser mode is enabled 
    * additional such as the http_referer, the http_request and the host will be send with each 
    * event.
    */
  setBrowserMode: function(flag)
  {
    inBrowser = !!flag;
  },
  
  /** sets the hostname
    * The host name will be send with each event, if it is set explicitly or when browser mode is
    * enabled
    */
  setHost : function(hostname)
  {
    host = hostname;
  },
  
  /** sets the installToken
    * Only use this method when you really need to overwrite the installToken.
    * E.g when you create a hybrid mobile version or switch hosts during one session.
    * The preferred way is to let PSIORI create an installToken for each Device.
    */
  setInstallToken: function(newInstallToken)
  {
    setItemInStorage('SampleToken', (installToken = newInstallToken), 'localStorage');
  },

  /** returns the present install token */
  installToken: function()
  {
    return installToken;
  },

  /** sets the sessionToken
    * Only use this method when you really need to overwrite the sessionToken.
    * E.g when you create a hybrid mobile version or switch hosts during one session.
    * The preferred way is to let PSIORI create an sessionToken for each session.
    */
  setSessionToken: function(newSessionToken)
  {
    setItemInStorage('SampleToken', (sessionToken = newSessionToken), 'sessionStorage');
  },
  
  /** returns the present session token */
  sessionToken: function()
  {
    return sessionToken;
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
    connector.add(endpoint, params, params.callback);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   SESSION EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** should be send on the start of a new session. 
    * At the start of each session send one sessionStart event with an appToken. Make sure that
    * the userId is set before starting this function. 
    * The params are optional.
    */
  sessionStart: function(newAppToken, newUserId, params)
  {    
    appToken = newAppToken || appToken;
    userId = newUserId || userId;

    this.pageEnd({
      automatic: true
    }); // close a page that has been opened earlier. 

    this.track('session_start', 'session', params);
  },
  
  /** should be send when the session receives an update 
    * The parameters field is optional.
    */
  sessionUpdate: function(params)
  {
    this.track('session_update', 'session', params);
  },
  
  /** should be send when the session gets paused */
  sessionPause: function()
  {
    this.track('session_pause', 'session');
  },
  
  /** should be send when the session resumes */
  sessionResume: function()
  {
    this.track('session_resume', 'session');
  },
  
  /** sends one ping event to the server.
    * if you want to send ping events automaticaly use the autoping method
    */
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
  
  /** Should be send when a new user did register
    * Each registration takes, besides the user id, an optional list of key-value pairs.
    */
  registration: function(newUserId, params)
  {
    userId = newUserId || userId;
    this.track('registration', 'account', params);
  },
  
  /** Should be send when an existing user signs in
    * Each sign intakes, besides the user id, an optional list of key-value pairs.
    */
  signIn: function(newUserId, params)
  {
    userId = newUserId || userId;
    this.track('sign_in', 'account', params);
  },
  
  /** Should be send when the account of the current user needs an update.
    * For example when an field relating to the account changes. Like the target group
    * or country
    */
  profileUpdate: function(params)
  {
    this.track('update', 'account', params);
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   CONTENT EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////


  /** should be send when a user views one or more contents. This event is
    * used for counting views per-content. An event should send at least one 
    * content id. Multiple content ids can be passed as array. The content type
    * is optional, wheres if no type is provided the default 
    * one, ‘content’ is taken (to distinguish this event from page-related 
    * views).
    */
  contentView: function(content_ids, content_type, params) 
  {
    params = params || {};
    params.content_type = content_type || params.content_type || 'content';

    if (isArray(content_ids)) 
    {
      params.content_ids = content_ids;
    }
    else 
    {
      params.content_id = content_ids;      
    }
    this.track('view', 'content', params);
  },
  
  /** should be send when a user interacts with one or more contents in-app 
    * A content usage event should take at least one product id. Multiple 
    * product ids can be passed as array. The content type is optional,
    * wheres if no type is provided the default 
    * one, ‘content’ is taken.
    */
  contentUsage: function(content_ids, content_type, params) 
  {
    params = params || {};
    params.content_type = content_type || params.content_type || 'content';

    if (isArray(content_ids)) 
    {
      params.content_ids = content_ids;
    }
    else 
    {
      params.content_id = content_ids;      
    }
    this.track('usage', 'content', params);
  },
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //  PAGE EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
 
 
  /** manually tracks a single page view / page impression. Each time you
   * send this event, the number of page impressions of the given page_id
   * will be increased by one. 
   *
   * This method is the most simplest way to track page impressions. You
   * have the full control in the client what is counted and what is not
   * counted.
   *
   * Please note that this event is stateless in the sense, that it does 
   * not support tracking of the time a user stayed on a particular page.
   * If you want more detailed information about page usage, use the 
   * alternative methods pageStart and pageEnd instead of using this 
   * method.
   *
   * Please note, if you use pageStart AND pageView, two events will be 
   * send and a page view will be counted twice.
   */ 
  pageView: function(page_id, params)
  {
    params              = params || {};
    params.content_type = 'page';
    params.page_id      = page_id;      
    this.track('view', 'content', params);
  }, 

  /** tracks a single view / page impression and sets the given page_id as
   * the present page viewed by the user. From hereon, ping-events will send
   * this page_id until the page impression is manually ended (by calling
   * pageEnd), another page is set with pageStart, or a call to sessionStart
   * happens.
   *
   * To indicate that the user has left this page or time shouldn't be tracked
   * any further, call pageEnd. pageEnd will be send automatically, if the 
   * user browses to another page where a new sessionStart or / pageStart is
   * called, or in case you do another call to pageStart within the same session,
   * for example, because you've loaded a second page using AJAX, thus, replacing
   * the old page, but not ending the page session.
   *
   * A usual implementation would have the following lines at the start of a page
   * inside a script tag:
   *   Sample.sessionStart();
   *   Sample.pageStart(your_page_id);
   *
   * An explicit call to pageEnd is not necessary, as each page uses these calls 
   * and thus would trigger an automatic page end.
   * 
   * If a pageStart is NOT ended, because for example the user closed the browser
   * tab, PSIORI will first accumulate the time of the time-stamps of ping events
   * including this page id, and, if there's not even a ping, would assume a 
   * default view time of 1s. 
   *
   * PSIORI will also give you the precentage of page-start events that were not
   * "closed" by an end-event.
   *
   * Please note that the more simple pageView call is a completely separated 
   * mechanism that does NOT interfere with pageStart / pageEnd and that you should 
   * NOT mix in your implementation, as it could lead to page views being counted 
   * twice. Use either pageStart/pageEnd OR pageView.
   */ 
  pageStart: function(page_id, params)
  {
    this.pageEnd({
      automatic: true
    }); // close a page that has been opened earlier.
    
    setPageId(page_id);
    this.pageView(page_id, params);
  },
  
  /** sends a view-end envent to indicate the user has left the present page. 
   * Will only send an event, if there's a page that has been "opened" with
   * a pageStart event and that hasn't been closed so far by a corresponding
   * pageEnd call. 
   */
  pageEnd: function(params)
  {
    var page_id = getPageId();
    
    if (page_id) 
    {
      params = params || {};
      params.page_id      = page_id;
      params.content_type = 'page';
      
      this.track('view-end', 'content', params);
      clearPageId();
    }
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
  
  /** should be send when a user triggers a purchase 
    * A purchase event should take at minimum the product_id, provider(payment provider), gross, 
    * currency, country and the product_category. The product id is identical with the product 
    * sku.
    */
  purchase: function(product_id, params)
  {
    var userParams = params || {};
    userParams.pur_product_sku = product_id;
    this.track('purchase', 'revenue', userParams);
  },
  
  /** should be send when a users charges his money back
    * A chargeback event should take at minimum the product_id, provider(payment provider), gross,
    * currency, country and the product_category. The product id is identical with the product 
    * sku.
    */
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
  })(),

  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   Custom events
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** This function can be used to send custom Events 
  * an eventName has to be included. If the event is tied to some sort of
  * numeric value it can be passed with the key acc_value
  */
  customEvent: function(eventName,params)
  {
    var userParams = params || {};
    this.track(eventName, 'custom', userParams);
  }

};

Sample.init();	

window.Sample = Sample;
})(window);