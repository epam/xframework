
module.exports = function(grunt) {

    grunt.registerTask('test', "X-Framework qunit test", function() {
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
                files: ['styles/*.css']
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

    grunt.loadNpmTasks('grunt-bower-task');

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        build: {
            all: {
                dest: "js/xf.js",
                minimum: ["core"]
            },
        },
        bower: {
            install: {
                options: {
                    targetDir: "bower_modules",
                    cleanup: true
                }
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
                    "styles/xf.css": ["styles/xf.css"]
                }
            },
            minify: {
                options: {
                    compile: true,
                    compress: true
                },
                files: {
                    "styles/xf.min.css": ["styles/xf.css"]
                }
            }
        }
    });

    // Load grunt tasks from NPM packages
    require("load-grunt-tasks")(grunt);

    // Integrate jQuery specific tasks
    grunt.loadTasks("build/tasks");


    grunt.registerTask('install', ['bower']);


    grunt.registerTask('default', ['build', 'uglify', 'less', 'recess']);

}; 
