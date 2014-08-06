

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

