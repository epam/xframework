$(function () {
    
    module("XF.Collection", {
        setup: function () {
            emptyCollection = new XF.Collection();
        }
    });
    test("empty and parse", 4, function() {

        equal(emptyCollection.url, '/');
        equal(emptyCollection.status.loading, false);
        equal(emptyCollection.status.loaded, false);
        equal(emptyCollection.status.loadingFailed, false);
    });
    
    asyncTest("predefined and parse", 2, function() {
        
        predefCollection = new XF.Collection();
        predefCollectionURL = '/test/test.json';
        ajaxSettingsWorks = false;

        predefCollection.url = predefCollectionURL;
        
        predefCollection.on('fetched', function () {
            ok(true);
            equal(ajaxSettingsWorks, false);
        });
        
        predefCollection.fetch();
        //predefCollection.parse();
        
    });
    
    // test("predefined and custom callback", 0, function() {
    // 
    //     predefCollection.url = predefCollectionURL;
    //     predefCollection.ajaxSettings.success = function () {
    //         ajaxSettingsWorks = true;
    //     }
    //     predefCollection.fetch();
    //     
    //     predefCollection.on('fetched', function () {
    //         equal(ajaxSettingsWorks, true);
    //     });
    // });
});