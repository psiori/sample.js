define(function(require) {
    
  var endpoint  = "http://events.psiori.com/sample/v01/event";
  var app_token = "unit_tests"; 

  describe('Connector', function() {
    
    this.timeout(5000);
    
    describe('#length()', function () {
        it('should return zero on startup', function () {
            connector.length().should.equal(0);
        });
    });    
    
    describe('#isEmpty()', function () {
        it('should return false on startup', function () {
            connector.isEmpty().should.equal(true);
        });
    });

    describe('#add()', function () {
        it('should add an event to the queue', function () {
            connector.stop();
            connector.isEmpty().should.equal(true);
            connector.add(endpoint, {});
            connector.isEmpty().should.equal(false);
            connector.length().should.equal(1);
        });
    });
    
    describe('#sendNext()', function() {
      it('should send an event to psiori', function(done) {
        connector.useXHR.should.equal(true);
        connector.clear();
        connector.isEmpty().should.equal(true);
        connector.start(); 
        connector.add(endpoint, {
                                  app_token: app_token,
                                  event_name: "test", 
                                  debug: true
                                },
                                function(payload, request) {
                                  should.exist(request);
                                  done();
                                });
      });
    });
  });
});