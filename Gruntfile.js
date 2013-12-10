module.exports = function (grunt) {
    
    grunt.registerTask('build', "X-Framework build", function () {
        console.log('Adding core elements');
        var jsSources = [
        'xf/src/xf.jquery.hooks.js',
        'xf/src/xf.core.js',
        'xf/src/xf.app.js',
        'xf/src/xf.touch.js',
        'xf/src/xf.router.js',
        'xf/src/xf.utils.js',
        'xf/src/xf.pages.js',
        'xf/src/xf.ui.js',
        'xf/src/xf.settings.js',
        'xf/src/xf.storage.js',
        'xf/src/xf.device.js',
        'xf/src/xf.collection.js',
        'xf/src/xf.model.js',
        'xf/src/xf.view.js',
        'xf/src/xf.component.js'
        ];

        // Run through files and detect icons to use
        //var lessSources = [];

        // License text

        var license = '';//fs.readFileSync('./LICENSE.txt');


        // TODO modules to add

        if (arguments.length === 0) {
            console.log('Adding all ui components');
            jsSources.push('xf/ui/*.js');
        } else {

            for (var i in arguments) {
                console.log('Adding ui for "' + arguments[i] + '"');
                jsSources.push('xf/ui/xf.ui.' + arguments[i] + '.js');
            }
        }

        grunt.initConfig({
            pkg: grunt.file.readJSON('package.json'),
            build: {
                all: {
                    dest: "js/xf.js",
                    minimum: [
                        "core"
                    ]
                }
            },
        
            uglify: {
                dist: {
                    files: {
                        'js/xf.min.js': ['<%= build.all.dest %>']
                    }
                }
            },
            less: {
                development: {
                    options: {
                        paths: ["styles"]
                    },
                    files: {
                        "styles/xf.css": "styles/xf.less"
                    }
                }
            },
            recess: {
                pretify: {
                    options: {
                        compile: true,
                    },
                    files: {
                        "styles/xf.css" : ["styles/xf.css"]
                    }
                },
                minify: {
                    options: {
                        compile: true,
                        compress: true
                    },
                    files: {
                        "styles/xf.min.css" : ["styles/xf.css"]
                    }
                }
            }
        });
        grunt.loadNpmTasks('grunt-contrib-uglify');
        grunt.loadNpmTasks('grunt-contrib-concat');
        grunt.loadNpmTasks('grunt-contrib-less');
        grunt.loadNpmTasks('grunt-recess');
        


        grunt.loadNpmTasks('grunt-bower-task');


        // Load grunt tasks from NPM packages
        require( "load-grunt-tasks" )( grunt );

        // Integrate jQuery specific tasks
        grunt.loadTasks( "build/tasks" );
        
        grunt.task.run(['build', 'uglify', 'less', 'recess']);
            
    });

    grunt.registerTask('test', "X-Framework qunit test", function () {
        grunt.initConfig({
            jshint: {
                options: {
                    jshintrc: '.jshintrc'
                },
                files: [
                'Gruntfile.js',
                'package.json',
                'xf/src/*.js',
                'xf/ui/*.js',
                'js/xf.js',
                'test/components/test.js',
                'test/src/*.js',
                'test/ui/*.js',
                'test/lib/run-qunit.js',
                'test/*.js'
                ]
            },
            recess: {
                options: {
                    compile: false,
                    noUniversalSelectors: false,
                    noOverqualifying: false,
                    zeroUnits: false
                },
                files:[
                'styles/*.css'
                ]
            },
            qunit: {
                files: ['test/index.html']
            }
        });
        grunt.loadNpmTasks('grunt-contrib-qunit');
        grunt.loadNpmTasks('grunt-contrib-jshint');
        grunt.loadNpmTasks('grunt-recess');
        grunt.task.run(['jshint', 'qunit', 'recess']);
    });


    grunt.registerTask('install', ['bower']);


    grunt.registerTask('default', ['build']);

};
