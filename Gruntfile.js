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
        }
    });
    
    grunt.loadNpmTasks('grunt-contrib-cssmin');

    grunt.registerTask('default', ['cssmin']);
}
