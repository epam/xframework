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
    
    test("empty and parse", 6, function() {

        equal(emptyCollection.url, '/');
        equal(emptyCollection.options, undefined);
        equal(emptyCollection.component, null);
        equal(emptyCollection.status.loading, false);
        equal(emptyCollection.status.loaded, false);
        equal(emptyCollection.status.loadingFailed, false);
    });
    
    asyncTest("predefined and parse", 4, function() {
        predefCollection.on('fetched', function () {
            ok(true);
            equal(ajaxSettingsWorks, false);
            equal(predefCollection.status.loading, false);
            equal(predefCollection.status.loaded, true);
            start();
        });
        
        predefCollection.fetch();
        
    });
    
    asyncTest("predefined and custom callback", 7, function() {
        ajaxSettingsWorks = true;
        
        predefCollectionCallback.on('fetched', function () {
            
            predefCollectionCallback.off('fetched').on('fetched', function () {
                ok(true);
                equal(ajaxSettingsWorks, true);
                equal(predefCollectionCallback.status.loading, false);
                equal(predefCollectionCallback.status.loaded, true);
                start();
            });
            
            predefCollectionCallback.refresh();
            equal(predefCollectionCallback.status.loading, true);
            equal(predefCollectionCallback.status.loaded, false);
            equal(predefCollectionCallback.ajaxSettings.silent, false);
        });
        
        predefCollectionCallback.fetch();
    });
});