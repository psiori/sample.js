
require([
  '../lib/sample/util.js',
  '../lib/sample/connector.js',
  '../lib/sample/xhr.js',
  '../lib/sample/pixel.js',
  '../lib/sample/core.js',
  'core.tests.js',
  'connector.tests.js',
  'pixel.tests.js',    
  'util.tests.js'    
], function(require) {
  if (window.mochaPhantomJS) 
  { 
    mochaPhantomJS.run(); 
  }
  else 
  { 
    mocha.checkLeaks();
    mocha.run(); 
  }
});
