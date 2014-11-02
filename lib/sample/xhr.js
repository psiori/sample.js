

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
         if (onSuccess) 
         {
           var request = {
             status: xhr.status,
             headers: xhr.getResponseHeader,
             url: url
           };
           var payload = {};
           
           try {
               payload = JSON.parse(payload.responseText);
           } catch (e) {}           
           
           onSuccess(payload, request);
         }
      }, true);

      xhr.addEventListener("error", function() 
      {
        if (onFailure) 
        {
          var request = {
            status: xhr.status,
            headers: xhr.getResponseHeader,
            url: url
          };
          var payload = {};
          
          try {
              payload = JSON.parse(payload.responseText);
          } catch (e) {}
          
          onFailure(payload, request);
        }
      });

      xhr.open("POST", url);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

      xhr.send(string);
    }
  };
  
  return that;
  
})();

