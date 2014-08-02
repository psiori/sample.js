define(function(require) 
{
  
  describe('Sample', function() 
  {
    it('should set constants correctly', function () 
    {
      Sample.PLATFORM_IOS.should.equal('ios');
      Sample.PLATFORM_WINDOWS.should.equal('windows');
      Sample.PLATFORM_BROWSER.should.equal('browser');
      Sample.PLATFORM_ANDROID.should.equal('android');
    });

    describe('#init', function () 
    {
      it('should be called automatically during loading', function () 
      {
        should.exist(installToken); // init sets install token
      });

      it('should fill necessary tokens', function () 
      {
        localStorage.removeItem('SampleToken');
        sessionStorage.removeItem('SampleToken');
        
        Sample.init();
        
        should.exist(installToken);
        should.exist(sessionToken);
        should.exist(platform);
        platform.should.equal(Sample.PLATFORM_BROWSER);
      });
      
      
      it('should not change already existing tokens', function () 
      {
        Sample.init(); 
        
        should.exist(installToken);
        should.exist(sessionToken);
        
        var itoken = installToken;
        var stoken = sessionToken;
        
        Sample.init();
        
        itoken.should.equal(installToken);
        stoken.should.equal(sessionToken);
      });
    });        


    describe('#getEndpoint', function () 
    {
      it('should return a string', function () 
      {
        Sample.getEndpoint().should.be.a('string');
      });
    });        
  });
  
  describe('Helpers', function() 
  {
    describe('#randomToken', function () 
    {
      it('should return a string', function () 
      {
        randomToken(12).should.be.a('string');
      });
      
      it('should place a delimiter char every four digits', function () 
      {
        randomToken(4).should.have.length(4);
        randomToken(5).should.have.length(6);
        randomToken(6).should.have.length(7);
        randomToken(7).should.have.length(8);
        randomToken(8).should.have.length(9);
        randomToken(9).should.have.length(11);
      });
      
      it('should use "-" as delimiter', function () 
      {
        randomToken(12)[4].should.equal('-');
      });
    });
    
    describe('#mergeParams', function () 
    {
      it('should only add values that are non-null', function () 
      {
        var params = { content_id: 99 };
        appToken = "myToken";
        
        var result = mergeParams(params, "event");
        
        result.app_token.should.equal("myToken");
        result.content_id.should.equal(99);
        should.not.exist(result.user_id);
        should.not.exist(result.content_ids);
      });
      
      it('should add some values only to sessionStart and Update', function () 
      {
        var params = { email: "test@test.com" };
        Sample.setPlatform(Sample.PLATFORM_IOS);
        
        should.not.exist(mergeParams(params, "event").platform);
        should.not.exist(mergeParams(params, "event").email);

        should.exist(mergeParams(params, "sessionStart").platform);
        should.exist(mergeParams(params, "sessionStart").email);

        should.exist(mergeParams(params, "sessionUpdate").platform);
        should.exist(mergeParams(params, "sessionUpdate").email);
        
        mergeParams(params, "sessionUpdate").platform.should.equal(Sample.PLATFORM_IOS);     
      });  
      
      it('should add necessary values', function () 
      {
        var params = { };
        
        should.exist(mergeParams(params, "event").install_token);
        should.exist(mergeParams(params, "event").session_token);
        should.exist(mergeParams(params, "event").timestamp);
        
        mergeParams(params, "event").install_token.should.equal(installToken);
        mergeParams(params, "event").session_token.should.equal(sessionToken);

      });    
    });
  });

});
 

 
 