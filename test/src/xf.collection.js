$(function () {
    module("XF.Collection", {
        setup: function () {
            ajaxSettingsWorks = false;
            
            emptyCollection = new XF.Collection();
            predefCollection = new XF.Collection();
            predefCollection.url = './test.json';
            
            predefCollectionCallback = _.extend(predefCollection, {});
        }
    });
    
    test("empty and parse", 4, function() {

        equal(emptyCollection.url, '/');
        equal(emptyCollection.status.loading, false);
        equal(emptyCollection.status.loaded, false);
        equal(emptyCollection.status.loadingFailed, false);
    });
    
    asyncTest("predefined and parse", 2, function() {
        predefCollection.on('fetched', function () {
            ok(true);
            equal(ajaxSettingsWorks, false);
            start();
        });
        
        predefCollection.fetch();
        
    });
    
    asyncTest("predefined and custom callback", 2, function() {
        ajaxSettingsWorks = true;
        
        predefCollectionCallback.on('fetched', function () {
            
            predefCollectionCallback.off('fetched').on('fetched', function () {
                ok(true);
                equal(ajaxSettingsWorks, true);
                start();
            });
            
            predefCollectionCallback.refresh();
        });
        
        predefCollectionCallback.fetch();
    });
});