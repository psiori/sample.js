
var endpoint     = "http://events.neurometry.com/sample/v01/event",
    installToken = null,
    appToken     = null,
    sessionToken = null,
    module       = null,
    userId       = null,
    email        = null,
    platform     = null,
    debug        = false,
    autoping     = null;
    
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
  safariOnly: false,
  
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
    if (this.safariOnly === true && !this.isSafari()) 
    {
      return ;
    }
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
  
  isSafari: (function() 
  {
    var memo = null;
    
    return function() 
    {
      if (memo === null) 
      {
        var ua = navigator.userAgent.toLowerCase(); 
        
        if (ua.indexOf('safari') != -1) 
        { 
          if (ua.indexOf('chrome') > -1) 
          {
            memo = false;
          } 
          else 
          {
            memo = true;
          }
        }
        else 
        {
          memo = false;
        }
      }
      return memo;
    };
  })()
};

Sample.init();	



