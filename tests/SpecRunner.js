
require([
  '../lib/sample/core.js',
  '../lib/sample/connector.js',
  'core.tests.js',
  'connector.tests.js'  
], function(require) {
  mocha.checkLeaks();
  mocha.run();
});
