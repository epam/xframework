// Phantomjs test for button

var page = require('webpage').create(),
    system = require('system'),
    address, output, size,
    testname = 'Button';

(function() {
    console.log('\x1b[0m\x1b[7mStart ' + testname + ' test!');

    if (system.args.length < 2) {
        console.log('Usage: tests/*.js URL [filename] [paperwidth*paperheight|paperformat] [zoom]');
        console.log('  paper (pdf output) examples: "5in*7.5in", "10cm*20cm", "A4", "Letter"');
        phantom.exit(1);
    } else {
        address = system.args[1];
        output = system.args[2];
        page.viewportSize = { width: 1024, height: 780 };

        if (system.args.length > 3 && system.args[2].substr(-4) === ".pdf") {
            size = system.args[3].split('*');
            page.paperSize = size.length === 2 ? { width: size[0], height: size[1], margin: '0px' }
                                               : { format: system.args[3], orientation: 'portrait', margin: '1cm' };
        }

        if (system.args.length > 4) {
            page.zoomFactor = system.args[4];
        }

        page.open(address, function (status) {

            if (status !== 'success') {
                console.log('\n\t\x1b[0m\033[31mUnable to load the address.\n');
                phantom.exit();
            } else {
                window.setTimeout(function () {

                    var result = page.evaluate(function () {
                        $('body').append(XF.UI.popup.createButton({text: 'Test button text'}));

                        if ($('.xf-button').length) {
                            return $('.xf-button').find('.xf-button-text').text();
                        }
                    }, 'result');

                    if (result === '' || result === null) {
                        console.log('\n\t\x1b[0m\033[31mError during button creation.\n');
                    } else {
                        console.log('\n\t\x1b[0m\033[32mButton \t\t\033[39m\x1b[1m[ ', result, ' ] \t\t\x1b[0m\033[32mcreated\n');
                    }

                    if (output) {
                        page.render(output);
                    }

                    phantom.exit();
                }, 200);
            }
        });
    }
})();