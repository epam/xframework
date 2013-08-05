module.exports = (function(grunt) {

    grunt.registerTask('build', "X-Framework build", function() {
        console.log('Adding core elements');
        var sources = [
            'xf/src/xf.core.js',
            'xf/src/xf.settings.js',
            'xf/src/xf.component.js',
            'xf/src/xf.cache.js',
            'xf/src/xf.device.js',
            'xf/src/xf.model.js',
            'xf/src/xf.pages.js',
            'xf/src/xf.router.js',
            'xf/src/xf.utils.js',
            'xf/src/xf.view.js',
            'xf/src/xf.touch.js',
            'xf/src/xf.jquery.hooks.js',
            'xf/src/xf.zepto.support.js',
            'xf/src/xf.ui.js'
        ];

        // TODO modules to add

        if (arguments.length === 0) {
            console.log('Adding all UI components');
            sources.push('xf/ui/*.js');
        } else {

            for (var i in arguments) {
                console.log('Adding UI for "' + arguments[i] + '"');
                sources.push('xf/ui/xf.ui.' + arguments[i] + '.js');
            }
        }

        sources.push();

        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            concat: {
                options: {
                    separator: '\n',
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n;(function (window, $, BB) {',
                    footer: '}).call(this, window, $, Backbone);'
                },
                dist: {
                    src: sources,
                    dest: 'js/xf.js'
                }
            },
            uglify: {
                dist: {
                    files: {
                        'js/xf.min.js': ['<%= concat.dist.dest %>']
                    }
                }
            },
        });
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.task.run(['concat', 'uglify']);
    });

    grunt.registerTask('default', ['build']);

});
