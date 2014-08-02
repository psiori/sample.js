
require([
  '../lib/sample/core.js',
  '../lib/sample/connector.js',
  '../lib/sample/xhr.js',
  '../lib/sample/pixel.js',
  'core.tests.js',
  'connector.tests.js',
  'pixel.tests.js'    
], function(require) {
  mocha.checkLeaks();
  mocha.run();
});
