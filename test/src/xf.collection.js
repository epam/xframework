$(function () {

    XF.on('component:test:constructed', function () {

        module("XF.Collection", {
            setup: function () {
           
            }
        });
        
        test("new and parse", 2, function() {
            equal(XF.getComponentByID('test').hasOwnProperty('collection'), true);
            
            equal(XF.getComponentByID('test').collection.status.loaded, true);
        });
    });
});