
require([
  '../lib/sample/util.js',
  '../lib/sample/core.js',
  '../lib/sample/connector.js',
  '../lib/sample/xhr.js',
  '../lib/sample/pixel.js',
  'core.tests.js',
  'connector.tests.js',
  'pixel.tests.js',    
  'util.tests.js'    
], function(require) {
  mocha.checkLeaks();
  mocha.run();
});
