module.exports = (function(grunt) {

    grunt.registerTask('build', "X-Framework build", function() {
        console.log('Adding core elements');
        var sources = [
            'js/xf/modules/xf.core.js',
            'js/xf/modules/xf.touch.js',
            'js/xf/modules/xf.zepto.support.js',
            'js/xf/modules/xf.ui.js'
        ];

        if (arguments.length === 0) {
            console.log('Adding all UI components');
            sources.push('js/xf/ui/*.js');
        } else {

            for (var i in arguments) {
                console.log('Adding UI for "' + arguments[i] + '"');
                sources.push('js/xf/ui/xf.ui.' + arguments[i] + '.js');
            }
        }
        sources.push('js/xf.js');

        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            concat: {
                options: {
                    separator: '\n\n//New file\n\n'
                },
                dist: {
                    src: sources,
                    dest: 'js/xf.js'
                }
            },
            uglify: {
                options: {
                    banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
                },
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
