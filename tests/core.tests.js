require('chai').should();
    
describe('Sample', function() {

    describe('#getEndpoint', function () {
        it('should return a string', function () {
            Sample.getEndpoint().should.be.a('string');
        });
    });    
})
 

 