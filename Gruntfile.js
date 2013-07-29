module.exports = (function(grunt) {

    grunt.registerTask('build', "X-Framework build", function() {
        console.log('Adding core elements');
        var sources = [
            'js/modules/xf.core.js',
            'js/modules/xf.touch.js',
            'js/modules/xf.zepto.support.js',
            'js/modules/xf.ui.js'
        ];

        if (arguments.length === 0) {
            console.log('Adding all UI components');
            sources.push('js/ui/*.js');
        } else {

            for (var i in arguments) {
                console.log('Adding UI for "' + arguments[i] + '"');
                sources.push('js/ui/xf.ui.' + arguments[i] + '.js');
            }
        }
        sources.push('js/xf.js');

        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            uglify: {
                beautyFile: {
                    options: {
                        banner: '/*!     <%= pkg.name %>     <%= grunt.template.today("yyyy-mm-dd") %>     */\n',
                        preserveComments: 'all',
                        beautify: true
                    },
                    files : {
                        'js/xf.js' : sources
                    }
                },
                minFile: {
                    options: {
                        banner: '/*!     <%= pkg.name %>     <%= grunt.template.today("yyyy-mm-dd") %>     */\n'
                    },
                    files : {
                        'js/xf.min.js' : sources
                    }
                }
            }
        });
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.task.run(['uglify']);
    });

    grunt.registerTask('default', ['build']);

});
