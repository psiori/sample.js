define(function(require) {
  
  describe('Sample', function() {

    describe('#getEndpoint', function () {
      it('should return a string', function () {
        Sample.getEndpoint().should.be.a('string');
      });
    });    
  });
  
});
 

 