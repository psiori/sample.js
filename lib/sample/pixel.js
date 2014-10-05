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