

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

