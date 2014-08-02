
var isArray = function(arg)
{
  if (typeof Array.isArray === 'undefined') 
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


var Pixel = (function() {
  
  var counter = 9900;
  
  var insertElement = function(iframe, url, callback)
  {
    var body    = document.getElementsByTagName("body")[0];
    var element = document.createElement(iframe ? 'iframe' : 'img');
    var key     = "sample-key-" + counter++;
    
    element.src = url;
    element.id = key;
    element.style.width = iframe ? "1px" : "0";
    element.style.height = iframe ? "1px" : "0";
    element.style.border = "0";
    element.style.margin = "0";
    element.style.padding = "0";
    element.style.position = "fixed";
    element.style.left = "0";
    element.style.top = "0";
    
    setTimeout(function() {
      body.removeChild(element);
      if (callback)
      {
        callback();
      }
    }, 500);
    
    body.insertBefore(element, body.childNodes[0]);
  };
  
  var that = {
    
    useIFrame: false,
    
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
      
      insertElement(this.useIFrame, url, onSuccess);
    }
  };
  
  return that;
})();