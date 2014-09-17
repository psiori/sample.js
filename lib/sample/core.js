var chooseProtocol = function()
{
  var protocol = (location.protocol || "https:");
  if (protocol !== "http:" && protocol !=="https:")
  {
    protocol = "https:";
  }
  return protocol;
};

var endpoint      = "http:" + /*chooseProtocol() +*/ "//events.neurometry.com/sample/v01/event",
    sdk           = "Sample.JS",
    sdk_version   = "0.0.1",
    installToken  = null,
    appToken      = null,
    sessionToken  = null,
    module        = null,
    userId        = null,
    email         = null,
    platform      = null,
    client        = null,
    client_version= null,
    longitude     = null,
    latitude      = null,
    ad_referer    = null,
    ad_campaign   = null,
    ad_placement  = null,
    locale        = null,
    autoping      = null,
    debug         = false;
    
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
    add("email",        userParams.email || email);
    add("locale",       userParams.locale || locale);
    
    add("ad_referer",    userParams.referer   || ad_referer);
    add("ad_campaign",   userParams.campaign  || ad_campaign);
    add("ad_placement",  userParams.placement || ad_placement);
    
    add("longitute",      userParams.longitude || longitude);
    add("latitude",       userParams.latitude  || latitude);
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
    if (this.isIE()) {
      return ;
    }
    params = mergeParams(params || {}, eventName, eventCategory);
    connector.add(params, function() { });
  },
  
  
  // /////////////////////////////////////////////////////////////////////////
  //
  //   SESSION EVENTS
  //
  // /////////////////////////////////////////////////////////////////////////
  
  /** should be send on the start of a new session. */
  sessionStart: function(newAppToken) 
  {
    appToken = newAppToken || appToken;
    this.track('session_start', 'session');
  },
  
  sessionUpdate: function() 
  {
    this.track('session_update', 'session');
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



