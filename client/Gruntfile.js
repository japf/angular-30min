'use strict';

module.exports = function (grunt) {

    // Load grunt tasks automatically
    require('load-grunt-tasks')(grunt);

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    grunt.loadNpmTasks('grunt-http');
    grunt.loadNpmTasks('grunt-shell-spawn');

    // Project settings
    var projectSettings = {
        // Project paths
        app: '.',
        deps: 'app/dependencies',
        dist: 'dist',
        tmp: '.tmp',
        tests: 'test',

        // Dist folders
        images: 'images',
        fonts: 'fonts',
        js: 'js',
        css: 'css',

        // JS files
        jsFiles: [
            '<%= project.app %>/app/**/*!(.test).js',
            '<%= project.app %>/common/**/*!(.test).js',
            '<%= project.app %>/modules/**/*!(.test).js'
        ]
    };

    // Define the configuration for all the tasks
    grunt.initConfig({
        // Expose project settings
        project: projectSettings,

        //Close started node sever
        http: {
            stopServerForTest: {
                options: {
                    url: 'http://127.0.0.1:9999/stopServer'
                }
            }
        },

        //call node server on 9999 port to serve json files for tests...
        shell: {
            startServerForTest: {
                options: {
                    async: true,
                    stdout: false,
                    failOnError: false
                },
                command: [
                    'set PORT=9999',
                    'node server'
                ].join('&&')
            }
        },

        // Watches files for changes and runs tasks based on the changed files
        watch: {
            js: {
                files: projectSettings.jsFiles,
                tasks: ['newer:jshint:all'],
                options: {
                    livereload: true
                }
            },
            html: {
                files: ['<%= project.app %>/**/*.html'],
                options: {
                    livereload: true
                }
            },
            gruntfile: {
                files: ['Gruntfile.js']
            },
            livereload: {
                options: {
                    livereload: '<%= connect.options.livereload %>'
                },
                files: [
                    '<%= project.app %>/**/*.html',
                    '<%= project.tmp %>/<%= project.css %>/*.css',
                    '<%= project.app %>/<%= project.images %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
                ]
            }
        },

        // The actual grunt server settings
        open: {
            server: {
                url: 'http://localhost:8000/#'
            }
        },

        connect: {
            options: {
                port: 8000,
                hostname: 'localhost',
                livereload: 35729
            },

            proxies: [
                {
                    context: '/api',
                    host: 'localhost',
                    port: 8080,
                    https: false,
                    changeOrigin: true,
                    xforward: false
                }
            ],
            livereload: {
                options: {
                    open: false,
                    base: [
                        '<%= project.tmp %>',
                        '<%= project.app %>'
                    ],
                    middleware: function (connect, options) {
                        if (!Array.isArray(options.base)) {
                            options.base = [options.base];
                        }

                        // Setup the proxy
                        var middlewares = [require('grunt-connect-proxy/lib/utils').proxyRequest];

                        // Serve static files.
                        options.base.forEach(function (base) {
                            middlewares.push(connect.static(base));
                        });

                        // Make directory browse-able.
                        var directory = options.directory || options.base[options.base.length - 1];
                        middlewares.push(connect.directory(directory));

                        return middlewares;
                    }
                }
            },
            test: {
                options: {
                    port: 9001,
                    base: [
                        '<%= project.tmp %>',
                        '<%= project.tests %>',
                        '<%= project.app %>'
                    ]
                }
            },
            dist: {
                options: {
                    base: '<%= project.dist %>'
                }
            }
        },

        // Empties folders to start fresh
        clean: {
            dist: {
                files: [
                    {
                        dot: true,
                        src: [
                            '.tmp',
                            '<%= project.dist %>/*',
                            '!<%= project.dist %>/.git*'
                        ]
                    }
                ]
            },
            server: '.tmp'
        },

        // Copies remaining files to places other tasks can use
        copy: {
            serve: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: '<%= project.dist %>',
                        dest: '<%= project.tmp %>',
                        src: [
                            '<%= project.images %>/**/*',
                            '<%= project.fonts %>/*'
                        ]
                    },
                    {
                        expand: true,
                        dot: true,
                        flatten: true,
                        src: projectSettings.fontFiles,
                        dest: '<%= project.tmp %>/<%= project.fonts %>'
                    }
                ]
            }
        }
    });


    grunt.registerTask('serve', function (target) {
        grunt.task.run([
            'clean:server',
            'configureProxies:server',
            'connect:livereload',
            'open',
            'watch'
        ]);
    });
};
