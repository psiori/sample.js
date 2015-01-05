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
    
    describe('#setEndpoint', function () 
    {
      it('should change endpoint value', function () 
      {
        Sample.setEndpoint("myendpoint");
        Sample.getEndpoint().should.equal('myendpoint');
      });
    }); 
    
    describe('#setAppToken', function () 
    {
      it('should change internal appToken value', function () 
      {
        Sample.setAppToken("token");
        appToken.should.equal('token');
      });
    });
    
    describe('#setModule', function () 
    {
      it('should change internal module value', function () 
      {
        Sample.setModule("module");
        module.should.equal('module');
      });
    });

    describe('#setUserId', function () 
    {
      it('should change internal userId value', function () 
      {
        Sample.setUserId("userId");
        userId.should.equal("userId");
      });
    });    

    describe('#setEmail', function () 
    {
      it('should change internal email value', function () 
      {
        Sample.setEmail("email");
        email.should.equal('email');
      });
    });

    describe('#getPlatform', function ()
    {
      it('should return a string', function ()
      {
        Sample.getEndpoint().should.be.a('string');
      });
    });

    describe('#setPlatform', function ()
    {
      it('should change internal platform value', function () 
      {
        Sample.setPlatform(Sample.PLATFORM_IOS);
        platform.should.equal(Sample.PLATFORM_IOS);
      });
    });           
    
    describe('#setDebug', function () 
    {
      it('should change debug value', function () 
      {
        Sample.setDebug(true);
        debugMode.should.equal(true);
        Sample.setDebug(false);
        debugMode.should.equal(false);
      });
    });

    describe('#setInstallToken', function()
    {
      it('should change internal installToken value', function ()
      {
         Sample.setInstallToken("2C56-9815-5C7C-945E-881F-B8FA");
         installToken.should.equal("2C56-9815-5C7C-945E-881F-B8FA");
      });
    });

    describe('#setSessionToken', function()
    {
      it('should change internal sessionToken value', function ()
      {
         Sample.setSessionToken("2C56-9815-5C7C-945E-881F-B8FA");
         sessionToken.should.equal("2C56-9815-5C7C-945E-881F-B8FA");
      });
    });
    
    describe('#[start|End]Group', function ()
    {
      it('should change set value in connector', function ()
      {
        Sample.endGroup();
        connector.isGroup().should.equal(false);
        Sample.startGroup();
        connector.isGroup().should.equal(true);
        Sample.endGroup();
        connector.isGroup().should.equal(false);
      });
    });
    
    describe('#[stop|resume]', function () 
    {
      it('should change set value in connector', function () 
      {
        Sample.resume();
        connector.isRunning().should.equal(true);
        Sample.stop();
        connector.isRunning().should.equal(false);
        Sample.resume();
        connector.isRunning().should.equal(true);
      });
    });
    
    var injectTrack = function(injectFunc, testFunc) 
    {
      var original = connector.add;
      
      connector.add = injectFunc;
      testFunc();
      
      connector.add = original;
    };
    
    describe('#track', function () 
    {
      it('should send event an event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('trackEvent');
          haveBeenCalled = true;
        }, function() {
          Sample.track('trackEvent', null);
          haveBeenCalled.should.equal(true);
        });
      });

      it('should merge event parameters', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.content_id.should.equal(99);
          haveBeenCalled = true;
        }, function() {
          Sample.track('trackEvent', 'test', { content_id: 99});
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#sessionStart', function () 
    {
      it('should send sessionStart event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('session_start');
          params.event_category.should.equal('session');
          params.user_id.should.equal('my_user_id');
          params.ad_referer.should.equal('my_referer');
          params.ad_campaign.should.equal('my_campaign');
          params.ad_placement.should.equal('my_placement');
          haveBeenCalled = true;
        }, function() {
          Sample.sessionStart('myToken', 'my_user_id',
                              {ad_referer: 'my_referer',
                              ad_campaign: 'my_campaign',
                              ad_placement: 'my_placement'});
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#sessionUpdate', function () 
    {
      it('should send sessionUpdate event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('session_update');
          params.event_category.should.equal('session');
          params.ad_referer.should.equal('my_referer');
          params.ad_campaign.should.equal('my_campaign');
          params.ad_placement.should.equal('my_placement');
          haveBeenCalled = true;
        }, function() {
                    Sample.sessionUpdate({ad_referer: 'my_referer',
                                         ad_campaign: 'my_campaign',
                                         ad_placement: 'my_placement'});
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#ping', function () 
    {
      it('should send ping event to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('ping');
          params.event_category.should.equal('session');
          haveBeenCalled = true;
        }, function() {
          Sample.ping();
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#autoping', function () 
    {
      it('should schedule ping timer', function () 
      {
        autoping = null;
        Sample.autoPing(60);
        should.exist(autoping);
      });
      
      it('should stop ping timer on non-positive argument', function () 
      {
        Sample.autoPing(60);
        should.exist(autoping);
        Sample.autoPing(0);
        should.not.exist(autoping);
      });
      
      it('should schedule ping timer if no argument given', function () 
      {
        Sample.autoPing(0);
        should.not.exist(autoping);
        Sample.autoPing();
        should.exist(autoping);
      });
    });
    
    describe('#contentUsage', function () 
    {
      it('should send correct event for single content to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('usage');
          params.event_category.should.equal('content');
          params.content_type.should.equal('content');
          params.content_id.should.equal(99);
          haveBeenCalled = true;
        }, function() {
          Sample.contentUsage(99);
          haveBeenCalled.should.equal(true);
        });
      });
      
      it('should send correct event for single page to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('usage');
          params.event_category.should.equal('content');
          params.content_type.should.equal('page');
          params.content_id.should.equal(88);
          haveBeenCalled = true;
        }, function() {
          Sample.contentUsage(88, 'page');
          haveBeenCalled.should.equal(true);
        });
      });
      
      it('should send correct event for multiple contents to connector', function () 
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('usage');
          params.event_category.should.equal('content');
          params.content_type.should.equal('content');
          
          should.not.exist(params.content_id);
          
          params.should.have.property("content_ids").of.length(2);
          
          params.content_ids[0].should.equal(88);
          params.content_ids[1].should.equal(99);

          haveBeenCalled = true;
        }, function() {
          Sample.contentUsage([88, 99], 'content');
          haveBeenCalled.should.equal(true);
        });
      });      
    });
    
    describe('#pageView', function () 
    {
      it('should send correct event for a page id to connector', function ()         
      {
        var haveBeenCalled = false;
          
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('view');
          params.event_category.should.equal('content');
          params.content_type.should.equal('page');
          params.page_id.should.equal(90);
          haveBeenCalled = true;
        }, function() {
          Sample.pageView(90);
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#pageStart', function() 
    {
      it('should send correct event for pageStart to connector', function ()         
      {
        var haveBeenCalled = false;
          
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('view');
          params.event_category.should.equal('content');
          params.content_type.should.equal('page');
          params.page_id.should.equal("90");
          haveBeenCalled = true;
        }, function() {
          Sample.pageStart("90");
          haveBeenCalled.should.equal(true);
        });
      });
      
      it('should set page_id in storage', function ()         
      {
        injectTrack(function(url, params, callback) {
        }, function() {
          Sample.pageStart("95");
          getPageId().should.equal("95");
          present_page_id.should.equal("95");
          getItemInStorage('page_id', 'sessionStorage').should.equal("95");
        });
      });
      
    });
    
    
    describe('#pageEnd', function() 
    {
      it('should send correct event for pageEnd to connector', function ()         
      {
        var haveBeenCalled = false;
          
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('view-end');
          params.event_category.should.equal('content');
          params.content_type.should.equal('page');
          params.page_id.should.equal("96");
          haveBeenCalled = true;
        }, function() {
          setPageId("96");
          Sample.pageEnd();
          haveBeenCalled.should.equal(true);
        });
      });
      
      it('should NOT send an event if there is not page_id in the storage', function ()         
      {
        var haveBeenCalled = false;
          
        injectTrack(function(url, params, callback) {
          haveBeenCalled = true;
        }, function() {
          clearPageId();
          Sample.pageEnd();
          haveBeenCalled.should.equal(false);
        });
      });
      
      it('should reset page_id in storage', function ()         
      {
        injectTrack(function(url, params, callback) {
        }, function() {
          setPageId("98");
          Sample.pageEnd();
          should.equal( getPageId(), null );
          should.equal( present_page_id, null );
          should.equal(getItemInStorage('page_id', 'sessionStorage'), null);
        });
      });
    });
    
           
           
    describe('#purchase', function ()
    {
      it('should send purchase event to connector', function ()
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('purchase');
          params.event_category.should.equal('revenue');
          
          params.pur_provider.should.equal("provider");
          params.pur_gross.should.equal(80);
          params.pur_currency.should.equal("EUR");
          params.pur_country_code.should.equal("DE");
          params.pur_earnings.should.equal(1);
          params.pur_product_category.should.equal("category");
          params.pur_receipt_identifier.should.equal("identifier");
         
          haveBeenCalled = true;
        }, function () {
          Sample.purchase(99, {pur_provider: "provider", pur_gross: 80,
                          pur_currency:"EUR", pur_country_code:"DE",
                          pur_earnings:1, pur_product_category:"category",
                          pur_receipt_identifier: "identifier"});
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#chargeback', function ()
    {
      it('should send chargeback event to connector', function ()
      {
        var haveBeenCalled = false;
        
        injectTrack(function(url, params, callback) {
          params.event_name.should.equal('chargeback');
          params.event_category.should.equal('revenue');
          
          params.pur_provider.should.equal("provider");
          params.pur_gross.should.equal(80);
          params.pur_currency.should.equal("EUR");
          params.pur_country_code.should.equal("DE");
          params.pur_earnings.should.equal(1);
          params.pur_product_category.should.equal("category");
          params.pur_receipt_identifier.should.equal("identifier");
          
          haveBeenCalled = true;
        }, function () {
          Sample.chargeback(99, {pur_provider: "provider", pur_gross: 80,
                            pur_currency:"EUR", pur_country_code:"DE",
                            pur_earnings:1, pur_product_category:"category",
                            pur_receipt_identifier: "identifier"});
          haveBeenCalled.should.equal(true);
        });
      });
    });
    
    describe('#isWebkit', function () 
    {
      it('should detect safari and chrome', function () 
      {
        var ua = navigator.userAgent.toLowerCase(); 
        var target = ua.indexOf('safari') !== -1 || ua.indexOf('chrome') !== -1;
        Sample.isWebkit().should.equal(target);
      });
    });
    
    describe('#setReferer', function () 
    {
      it('should set referer, campaign and placement', function () 
      {
        Sample.setReferer('ref', 'camp', 'placement');
        ad_referer.should.equal('ref');
        ad_campaign.should.equal('camp');
        ad_placement.should.equal('placement');
      });
      
      it('should merge referer, campaign and placement for session_start', function () 
      {
        Sample.setReferer('ref1', 'camp1', 'place1');
        var params = mergeParams({}, "session_start");
        params.should.have.property('ad_referer').that.equals('ref1');
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
        userId = null;
        
        var result = mergeParams(params, "event");
        
        result.app_token.should.equal("myToken");
        result.content_id.should.equal(99);
        should.not.exist(result.user_id);
        should.not.exist(result.content_ids);
      });
      
      it('should add some values only to session_start and Update', function () 
      {
        var params = { email: "test@test.com" };
        
        should.not.exist(mergeParams(params, "event").email);

        should.exist(mergeParams(params, "session_start").email);

        should.exist(mergeParams(params, "session_update").email);
        
        mergeParams(params, "session_update").email.should.equal(params.email);     
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
 

 
 
