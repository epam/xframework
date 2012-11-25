$(function(){

    XF.requireComponent('tabs', function(TabsComponent) {

        var extending = {

            viewClass : TabsComponent.prototype.viewClass.extend({
                templateURL: 'js/tmpl/TabsComponent.tmpl'
            }),

            tabsPerRow : 3,
            tabsClass : 'myCustomTab',
            tabsData : [{
                text : 'myCTab 1',
                href : '/x1',
                class : 'asd'
            }, {
                text : 'myCTab 2',
                href : '/x2',
                class : 'asd2'
            }, {
                text : 'myCTab 3',
                href : '/x3',
                class : 'asd3'
            }, {
                text : 'myCTab 4',
                href : '/x4',
                class : 'asd4'
            }, {
                text : 'myCTab 5',
                href : '/x5',
                class : 'asd5'
            }]

        };

        XF.defineComponent(
            'custom-tabs',
            TabsComponent.extend(extending, {})
        );

    })
});