//
// Contains helper functions that will be hidden in the library's closure.
//

var isArray = function(arg)
{
  if (typeof Array.isArray !== 'undefined') 
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

var isOnline = function()
{
  return navigator.userAgent.match(/PhantomJS/) || navigator.onLine;
};