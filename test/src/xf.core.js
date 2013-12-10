$(function () {
    module("XF.Core", {
        setup: function () {
            required = false;
        }
    });
    
    test("common", 1, function() {

        equal('XF' in window, true);
    });
    
    test("history", 2, function() {
        
        equal(XF.history.options.pushState, false);
        equal(XF.history.root, "/");
    });
    
    test("required component", 1, function() {
        
        XF.require('test', function () {
            required = true;
        });
        
        equal(required, true);
    });
});