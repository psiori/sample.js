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
    installToken  = null,
    appToken      = null,
    sessionToken  = null,
    module        = null,
    userId        = null,
    email         = null,
    platform      = null,
    longitude     = null,
    latitude      = null,
    add_referer   = null,
    add_campaign  = null,
    add_placement = null,
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

  
  if (eventName === "sessionStart" ||
      eventName === "sessionUpdate") 
  {
    add("email",        userParams.email || email);
    add("platform",     userParams.platform || platform);
    add("locale",       userParams.locale || locale);
    
    add("add_referer",    userParams.referer   || add_referer);
    add("add_campaign",   userParams.campaign  || add_campaign);
    add("add_placement",  userParams.placement || add_placement);
    
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
  
  setUserId: function(newUserId) 
  {
    userId = newUserId;
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
    add_referer = referer || null;
    add_campaign = campaign || null;
    add_placement = placement || null;
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

  track: function(eventName, eventCategory, params) 
  {
    if (this.isIE()) {
      return ;
    }
    params = mergeParams(params || {}, eventName, eventCategory);
    connector.add(params, function() { });
  },
  
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
  
  registration: function(userId, params)
  {
    this.track('registration', 'account', params);
  },
  
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



