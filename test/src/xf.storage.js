$(function () {
    module("XF.Storage", {
        setup: function () {
            XF.storage.init();
            setItem = 'test';
        }
    });
    
    test("common", 2, function() {
       
        equal(XF.storage.storage, window.localStorage);
        equal(XF.storage.isAvailable, true);
    });
    
    test("methods", 2, function() {
        XF.storage.set('set', 'test');
        equal(XF.storage.get('set'), setItem);
        
        XF.storage.clear();
        equal(XF.storage.get('set'), undefined);
    });
});