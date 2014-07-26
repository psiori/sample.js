

var endpoint = "http://localhost:3000/sample/v01/event",
    appToken = null;

var Sample = {
    setEndpoint: function(newEndpoint) {
      endpoint = newEndpoint;
    },

    getEndpoint: function() {
      return null;
      return endpoint;
    },

    setAppToken: function(newAppToken) {
      appToken = newAppToken;
    },

    track: function(eventName, params) {
      params.event_name = eventName;
      params.app_token = appToken;

      connector.add(params, function() { });
    }
};	
