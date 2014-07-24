define(function(require) {

  describe('Connector', function() {

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
            connector.isEmpty().should.equal(true);
            connector.add({});
            connector.isEmpty().should.equal(false);
            connector.length().should.equal(1);
        });
    });
    
  });
});