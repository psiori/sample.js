define(function(require) 
{
  describe('Pixel-Helpers', function() 
  {
    describe('#isArray()', function () 
    {
      it('should return true for arrays', function () 
      {
        isArray([]).should.be.ok;
        isArray([1]).should.be.ok;
        isArray([1,2]).should.be.ok;
        isArray(new Array(1,2)).should.be.ok;
      });
    
      it('should return false for other datatypes', function () 
      {
        isArray().should.not.be.ok;
        isArray(null).should.not.be.ok;
        isArray({ key1: "1", key2: "2" }).should.not.be.ok;
        isArray(1).should.not.be.ok;
        isArray("array").should.not.be.ok;
      });
      
      it('should use Array.isArray if present', function ()
      { // this test was introduced to a bug in the isArray function
        var oldFunc = Array.isArray;
        Array.isArray = function() { return 'usedArray'; };
        isArray([]).should.equal('usedArray');
      });
    });  
  });
});