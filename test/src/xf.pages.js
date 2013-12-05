$(function () {
    module("XF.Pages", {
        setup: function () {
            pagesBoolean = false;
        }
    });
    
    test("common", 11, function() {

        equal(XF.pages.status.started, false);
        equal(XF.pages.pageClass, 'xf-page');
        equal(XF.pages.activePageClass, 'xf-page-active');
        
        equal(XF.pages.animations.next, null);
        equal(XF.pages.animations.activePage, null);
        equal(XF.pages.animations.activePageName, null);
        equal(XF.pages.animations.standardAnimation, 'slideleft');
        equal('slideleft' in XF.pages.animations.types, true);
        equal('slideright' in XF.pages.animations.types, true);
        equal('fade' in XF.pages.animations.types, true);
        equal('none' in XF.pages.animations.types, true);
    });
    
    test("methods", 3, function() {

        XF.pages.setDefaultAnimationType('none');
        equal(XF.pages.animations.standardAnimation, 'none');
        
        XF.pages.setNextAnimationType('fade');
        equal(XF.pages.animations.next, 'fade');
        
        equal(XF.pages.show(), undefined);
    });
});