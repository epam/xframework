$(function () {
    
    module("XF.Model", {
        setup: function () {
            ajaxSettingsModelWorks = false;
            
            emptyModel = new XF.Collection();
            predefModel = new XF.Collection();
            predefModel.url = './test.json';
            
            predefModelCallback = _.extend(predefModel, {});
        }
    });
    
    test("empty and parse", 6, function() {

        equal(emptyModel.url, '/');
        equal(emptyModel.options, undefined);
        equal(emptyModel.component, null);
        equal(emptyModel.status.loading, false);
        equal(emptyModel.status.loaded, false);
        equal(emptyModel.status.loadingFailed, false);
    });
    
    asyncTest("predefined and parse", 2, function() {
        predefModel.on('fetched', function () {
            console.log('PREFERED TEST');
            ok(true);
            equal(ajaxSettingsModelWorks, false);
            start();
        });
        
        predefModel.fetch();
        
    });
    
    asyncTest("predefined and custom callback", 4, function() {
        ajaxSettingsModelWorks = true;
        
        predefModelCallback.on('fetched', function () {
            
            predefModelCallback.off('fetched').on('fetched', function () {
                ok(true);
                equal(ajaxSettingsModelWorks, true);
                equal(predefModelCallback.status.loading, false);
                equal(predefModelCallback.status.loaded, true);
                start();
            });
            
            predefModelCallback.refresh();
        });
        
        predefCollectionCallback.fetch();
    });
});