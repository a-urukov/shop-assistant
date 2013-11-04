module.exports = function(grunt) {
    
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        cssmin: {
            admin: {
                src: ['static/css/admin/*.css'],
                dest: 'static/css/bundles/admin.min.css',
                ext: 'min.css'
            },
            vendor: {
                src: ['static/css/vendor/*.css'],
                dest: 'static/css/bundles/vendor.min.css'
            }
        },

        browserify: {
            admin: {
                files: {
                    'static/js/bundles/admin.js': ['static/js/admin-page/script.js']
                }
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            jquery: {
                src: ['static/js/vendor/jquery-1.10.2.js'],
                dest: 'static/js/bundles/jquery-1.10.2.js'
            },
            vendor: {
                src: [
                    'static/js/vendor/underscore.js', 'static/js/vendor/backbone.js',
                    'static/js/vendor/bootstrap.js', 'static/js/vendor/select2.js', 'static/js/vendor/data-tables.js'
                ],
                dest: 'static/js/bundles/vendor.js'
            }
        },

        uglify: {
            jquery: {
                files: {
                    'static/js/bundles/jquery-1.10.2.min.js': ['static/js/vendor/jquery-1.10.2.js']
                }
            }
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');

    grunt.registerTask('default', ['cssmin', 'browserify', 'concat']);
    grunt.registerTask('production', ['cssmin', 'browserify', 'concat', 'uglify']);

}
