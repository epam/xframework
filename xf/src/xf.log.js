define([
    './xf.core',
    'underscore'
], function(XF, _) {

    var logMap = ['log', 'warn', 'error', 'info'],
        logPrefix = 'XF >> ',
        console = window.console || {};

    XF.log = function(log) {
        if (_.isFunction(console['log']) && XF.log.enabled) {
            console.log(logPrefix + log);
        }
    };

    XF.log.enabled = true;

    _.each(logMap, function(type) {

        XF.log[type] = function(log) {
            if (_.isFunction(console[type]) && XF.log.enabled) {
                console[type](logPrefix + log);
            }
        };

    });

    return XF;
});