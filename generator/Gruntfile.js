module.exports = function(grunt) {
    
    grunt.initConfig({
        connect: {
            server: {
                options: {
                    port: 8000,
                    protocol: 'http',
                    hostname: 'localhost',
                    base: 'web/'
                }
            }
        },
        sass: {
            dist: {
                files: {
                    'web/css/style.css': 'dev/sass/base.scss'
                }
            }
        },
        htmlmin: {
            dist: {
                options: {
                    collapseWhitespace: true
                },
                files: {
                    'web/index.html': 'dev/index.html'
                }
            }
        },
        watch: {
            options: {
                livereload: true
            },
            scripts: {
                files: ['dev/sass/**.scss'],
                tasks: ['sass'],
                options: {
                    interrupt: true
                }
            },

            html: {
                files: ['dev/**.html'],
                tasks: ['htmlmin'],
                options: {
                    interrupt: true
                }
            }
        }
    });

    // 'ftp-deploy': {
    //     build: {
    //         auth: {
    //             host: 'airtribune.mnb-t.com',
    //             port: 21,
    //             authKey: 'key1'
    //         },
    //             src: 'path/to/source/folder',
    //             dest: '/path/to/destination/folder',
    //             exclusions: ['path/to/source/folder/**/.DS_Store', 'path/to/source/folder/**/Thumbs.db', 'path/to/dist/tmp']
    //     }
    // }

    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-htmlmin');

    grunt.registerTask('default', ['connect', 'watch']);
    // grunt.loadNpmTasks('grunt-ftp-deploy');
}