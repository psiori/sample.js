define(function(require) 
{
  describe('Pixel', function() 
  {
    describe('#send()', function () 
    {
      it('should add element to DOM', function () 
      {
        Pixel.useIFrame = true;
        Pixel.send('test.html', { p: { event_name: 'event' }});

        var iframes = document.getElementsByTagName('iframe');
        (iframes.length > 0).should.equal(true);
        
        var count = 0;
        for (var i=0; i < iframes.length; i++) {
          count += iframes[i].src.indexOf("test.html") !== -1 ? 1 : 0;
        }
        (count > 0).should.equal(true);
      });
    });    
    
    describe('#encodeArray()', function () 
    {
      it('should correctly encode an array', function () 
      {
        encodeArray([{ key1 : 1 }, { key2 : 2 }], "n").should.have.length(2);
        encodeArray([{ key1 : 1 }], "n")[0].should.equal("n[0][key1]=1");
      });
    });
  });
});