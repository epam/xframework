define([
    '../../../xf/src/dom/dom',
    'jquery',
    'text!./data.html',
    'sinon'
], function(Dom, $, html, sinon) {

    module('Dom', {
        setup: function() {
            $('#qunit-fixture').html(html);
        },
        teardown: function() {
            $('#qunit-fixture').html('');
        }
    });

    test('Create Dom with different elements.', function() {
        var domElement = $('#dom')[0];
        var result = Dom('#dom');
        equal(result._element[0], domElement, 'Create with string selector.');
        result = Dom(domElement);
        equal(result._element[0], domElement, 'Create with DOM element.');
        result = Dom($('#dom'));
        equal(result._element[0], domElement, 'Create with jQuery object.');
        result = Dom(Dom('#dom'));
        equal(result._element[0], domElement, 'Create with Dom object.');
    });

    test('Check Dom traversal methods.', 14, function() {
        var domElement = $('#dom')[0];
        var firstSpan = $('#span1')[0];
        var result = Dom('#dom');

        equal(result.attr('custom'), 'Custom attr', 'Check Dom.fn.attr.');
        equal(result.data('first'), 'Data first', 'Check Dom.fn.data get.');

        result = result.data('second', 'Data second');
        equal(result.data('second'), 'Data second', 'Check Dom.fn.data set.');

        ok(result.is(':visible'), 'Check Dom.fn.is.');
        equal(result.append('<span id="span3"></span>')._element[0], domElement,
                'Check Dom.fn.append response.');
        equal($('#dom span').size(), 3, 'Check Dom.fn.append works correctly.');

        result = result.find('span');
        equal(result._element.size(), 3, 'Check Dom.fn.find.');
        equal(result.parent()._element[0], domElement, 'Check Dom.fn.parent.');
        equal(result.first()._element[0], firstSpan, 'Check Dom.fn.first.');
        equal(result.filter('.filtered')._element[0], firstSpan,
                'Check Dom.fn.filter.');
        equal(result.eq(0)._element[0], firstSpan, 'Check Dom.fn.eq.');
        equal(result.size(), 3, 'Check Dom.fn.size.');
        equal(result.get(0), firstSpan, 'Check Dom.fn.get.');

        var callback = sinon.spy();
        result.each(callback);
        ok(callback.calledThrice, 'Check Dom.fn.each.');
    });

    test('Check Dom events methods.', function() {
        var domElement = $('#dom')[0];
        var firstSpan = $('#span1')[0];
        var result = Dom('#dom');

        var callbackOnDiv = sinon.spy();
        equal(result.on('click', callbackOnDiv)._element[0], domElement,
                'Check Dom.fn.on returns Dom.');
        $(domElement).click();
        ok(callbackOnDiv.calledOnce, 'Check Dom.fn.on works.');

        var callbackOnSpan = sinon.spy();
        equal(result.on('click', 'span', callbackOnSpan)._element[0],
                domElement, 'Check delegated Dom.fn.on returns Dom.');
        $(firstSpan).click();
        ok(callbackOnSpan.calledOnce, 'Check delegated Dom.fn.on works.');

        var callbackOnBind = sinon.spy();
        equal(result.bind('dblclick', callbackOnBind)._element[0], domElement,
                'Check Dom.fn.bind returns Dom.');
        $(domElement).dblclick();
        ok(callbackOnBind.calledOnce, 'Check Dom.fn.bind works.');

        equal(result.trigger('dblclick')._element[0], domElement,
                'Check Dom.fn.trigger returns Dom.');
        ok(callbackOnBind.calledTwice, 'Check Dom.fn.trigger works.');

        equal(result.unbind('dblclick', callbackOnBind)._element[0], domElement,
                'Check Dom.fn.unbind returns Dom.');
        $(domElement).dblclick();
        ok(callbackOnBind.calledTwice, 'Check Dom.fn.unbind works.');

        var callbackOnAnimationEnd = sinon.spy();
        equal(result.animationEnd(callbackOnAnimationEnd)._element[0],
                domElement, 'Check Dom.fn.animationEnd returns Dom.');
        $(domElement).trigger('animationend');
        ok(callbackOnAnimationEnd.calledOnce,
                'Check Dom.fn.animationEnd works.');
    });

    test('Check Dom style methods.', function() {
        var domElement = $('#dom')[0];
        var result = Dom('#dom');

        equal(result.addClass('class1')._element[0], domElement,
                'Check Dom.fn.addClass returns Dom.');
        equal(domElement.className, 'class1', 'Check Dom.fn.addClass works.');
        equal(result.removeClass('class1')._element[0], domElement,
                'Check Dom.fn.removeClass returns Dom.');
        equal(domElement.className, '', 'Check Dom.fn.removeClass works.');

        equal(result.width(100)._element[0], domElement,
                'Check set Dom.fn.width returns Dom.');
        equal(result.width(), 100, 'Check get Dom.fn.width works.');
        equal(result.height(50)._element[0], domElement,
                'Check set Dom.fn.height returns Dom.');
        equal(result.height(), 50, 'Check get Dom.fn.height works.');
    });

    test('Check Dom root property.', function() {
        equal(Dom.root._element[0], document.body, 'Check Dom.root.');
    });

    test('Check Dom ajax method.', function() {
        var callback = sinon.spy();
        var fakeXhr = sinon.useFakeXMLHttpRequest();
        var requests = [];
        fakeXhr.onCreate = function (xhr) {
            requests.push(xhr);
        };

        Dom.ajax({url: '/hello/world', complete: callback});

        equal(requests.length, 1, 'Check request sent one time.');
        equal(requests[0].url, '/hello/world', 'Check that correct url used.');
        requests[0].respond(
                200, { "Content-Type": "application/text" }, 'Hello World');

        ok(callback.calledOnce, 'Check response processed.');
        equal(callback.args[0][0].responseText, 'Hello World',
                'Check that response is correct.');
        equal(callback.args[0][1], 'success', 'Check that request success.');
        fakeXhr.restore();
    });

    test('Check Dom ready method.', function() {
        var callback = sinon.spy();
        Dom.ready(callback);
        ok(callback.calledOnce, 'Check that Dom.ready invoked immediately.');
    });

    test('Check Dom viewport sizes.', function() {
        ok(!isNaN(Dom.viewport.height()), 'Check Dom.viewport.height method.');
        ok(!isNaN(Dom.viewport.width()), 'Check Dom.viewport.width method.');
    });

    test('Check Dom bindAnimations method.', function() {
        Dom.bindAnimations();

        var callback = sinon.spy();
        var domElement = $('#dom')[0];
        ok($(domElement).swipe, 'Swipe is method of $.fn.');
        $(domElement).swipe(callback);
        $(domElement).trigger('swipe');
        ok(callback.calledOnce, 'Swipe has been called.');
    });

    test('Check Dom trackDomChanges method.', function() {
        var callback = sinon.spy();
        var domElement = $('#dom')[0];

        Dom.trackDomChanges('span', callback);

        $(domElement).append('<span id="span3"></span>');

        ok(callback.calledOnce, 'DOM has changed and event triggered.');
        $(domElement).html('<div></div>');
        ok(callback.calledOnce,
                'DOM has changed and event is not triggered.');
    });
});
