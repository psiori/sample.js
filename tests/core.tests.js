define(function(require) {
  
  describe('Sample', function() {

    describe('#getEndpoint', function () {
      it('should return a string', function () {
        Sample.getEndpoint().should.be.a('string');
      });
    });        
  });
  
  describe('Helpers', function() {
    describe('randomToken', function () {
      
      it('should return a string', function () {
        randomToken(12).should.be.a('string');
      });
      
      it('should place a delimiter char every four digits', function () {
        randomToken(4).should.have.length(4);
        randomToken(5).should.have.length(6);
        randomToken(6).should.have.length(7);
        randomToken(7).should.have.length(8);
        randomToken(8).should.have.length(9);
        randomToken(9).should.have.length(11);
      });
      
      it('should use "-" as delimiter', function () {
        randomToken(12)[4].should.equal('-');
      });
      
    });
  });

});
 

 