$(function() {

    XF.on('component:test:constructed', function () {

        module("XF.ui", {

        });

        test('header', 1, function () {
            equal($(XF.ui.header.selector).attr('data-skip-enhance'), 'true');
            $(XF.ui.header.selector).remove();
        });

        test('footer', 1, function () {
            equal($(XF.ui.footer.selector).attr('data-skip-enhance'), 'true');
            $(XF.ui.footer.selector).remove();
        });

        test('button', 1, function () {
            equal($(XF.ui.button.selector).attr('data-skip-enhance'), 'true');
//            $(XF.ui.button.selector).remove();
        });

        test('checkbox & radio', 1, function () {
            equal($('#checkbox').attr('data-skip-enhance'), 'true');
            $('#checkbox').parents('.xf-input-checkbox').parent().remove();
        });

        test('fieldset', 1, function () {
            equal($(XF.ui.fieldset.selector).attr('data-skip-enhance'), 'true');
            $(XF.ui.fieldset.selector).remove();
        });

        test('text input', 1, function () {
            equal($(XF.ui.input.selector).attr('data-skip-enhance'), 'true');
            $(XF.ui.input.selector).remove();
        });

        test('tabs', 1, function () {
            equal($(XF.ui.tabs.selector).attr('data-skip-enhance'), 'true');
            $(XF.ui.tabs.selector).remove();
        });

        test('list', 1, function () {
            equal($(XF.ui.list.selector).attr('data-skip-enhance'), 'true');
            $(XF.ui.list.selector).remove();
        });

        test('loader', 1, function () {
            var loader = XF.ui.loader.create();
            XF.ui.loader.show(loader);
            equal(loader.attr('data-skip-enhance'), 'true');
            XF.ui.loader.remove(loader);
        });
    });
});