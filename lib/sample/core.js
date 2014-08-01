

var endpoint = "http://events.neurometry.com/sample/v01/event",
    appToken = null;

var Sample = {
  safariOnly: false,
  
  setEndpoint: function(newEndpoint) {
    endpoint = newEndpoint;
  },

  getEndpoint: function() {
    return endpoint;
  },

  setAppToken: function(newAppToken) {
    appToken = newAppToken;
  },

  track: function(eventName, params) {
    if (this.safariOnly === true && !this.isSafari()) {
      return ;
    }
    
    params.event_name = eventName;
    params.app_token = appToken;

    connector.add(params, function() { });
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
