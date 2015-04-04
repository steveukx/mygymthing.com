module.exports = function(grunt) {

    'use strict';

    require('jit-grunt')(grunt, {
        release: 'grunt-release-steps'
    });

    grunt.registerTask('serve', function () {

        var done = this.async();
        var express = require('express');
        var app = express();

        var config = grunt.config('pkg');
        for (var property in config) {
            if (config.hasOwnProperty(property)) {
                app.set(property, app.locals[property] = config[property]);
            }
        }

        app.set('views', './web');
        app.set('view engine', 'mustache');
        app.engine('mustache', require('hogan-middleware').__express);

        app.use('/' + grunt.config.get('pkg.version'), require('less-middleware')(__dirname + '/web'));
        app.use('/' + grunt.config.get('pkg.version'), express.static(__dirname + '/web'));

        app.use('/', function (req, res, next) {
            var strip = /(\.html|\/)$/;
            if (strip.test(req.url)) {
                var viewName = req.url.substr(1).replace(strip, '') || 'index';
                console.log('Rendering ', viewName);
                res.render(viewName);
            }
            else {
                next();
            }
        });

        app.get('/exit', function (req, res) {
            res.send('OK');
            done(true);
        });

        app.listen(9090);
    });

    grunt.registerTask('dist', 'dist content helper', function () {
        var done = this.async();
        var target = this.args[0];
        var Git = require('simple-git');
        var files = 'dist/*';

        switch (target) {
            case "update":
                grunt.config.merge({
                    pkg: grunt.file.readJSON('package.json')
                });
                done(true);
                break;

            case "purge":
                var git = new Git()
                    .rm(files, function (err) {
                        if (!err) {
                            grunt.log.writeln('No error adding dist files to be removed');
                            git.commit('Remove existing built content', files, function (err) {
                                grunt.log.writeln('Committed removing dist files');
                                if (err) {
                                    grunt.log.warn(err);
                                }
                                done(!err);
                            });
                        }
                        else if (/did not match/.test(err)) {
                            grunt.log.ok('No dist files to remove');
                            done(true);
                        }
                        else {
                            grunt.log.writeln('Got errors removing dist files');
                            grunt.fail.fatal(err);
                        }
                    });
                break;

            case "persist":
                new Git()
                    .add(files)
                    .commit('Adding built content', files, function (err) {
                        if (err) {
                            grunt.log.warn(err);
                        }

                        done(!err);
                    });
                break;

            case "latest":
                var fs = require('fs');
                fs.exists('dist/latest', function(exists) {
                    if (exists) {
                        fs.unlinkSync('dist/latest');
                    }

                    fs.symlink(grunt.config.get('pkg.version'), 'dist/latest', function(err) {
                        err && grunt.fatal(err);
                        done(!err);
                    });
                });
                break;

            default:
                grunt.fail.fatal("Unknown target: " + this.name + ":" + target);
        }
    });

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        release: {
            options: {
                file: 'package.json',
                tagName: '<%= version %>', //default: '<%= version %>'
                commitMessage: 'Release <%= version %>', //default: 'release <%= version %>'
                tagMessage: 'Tag version <%= version %>' //default: 'Version <%= version %>'
            }
        },

        less: {
            production: {
                options: {
                    paths: ['web/css']
                },
                files: {
                    'dist/css/index.css': 'web/css/index.less'
                }
            },
            min: {
                options: {
                    paths: ['web/css'],
                    cleancss: true
                },
                files: {
                    'dist/css/index.min.css': 'web/css/index.less'
                }
            }
        },

        copy: {
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: 'web/',
                        src: [
                            'fonts/*'
                        ],
                        dest: 'dist/'
                    }
                ]
            }
        },

        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= pkg.version %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            build: {
                files: {
                    'dist/<%= pkg.name %>.min.js': 'dist/<%= pkg.name %>.js'
                }
            }
        },

        requirejs: {
            compile: {
                options: {
                    out: 'dist/<%= pkg.name %>.js',
                    name: 'App',
                    baseUrl: 'web/js/',
                    optimize: 'none',
                    include: [
                    ],
                    shim: {
                    },
                    paths: {
                    }
                }
            }
        },

        clean: ['dist']
    });

    //grunt.registerTask('default', ['requirejs', 'uglify']);

    grunt.registerTask('install', ['copy', 'less'
        //, 'requirejs', 'uglify'
    ]);

    // tags the project on the new version and pushes everything to remote
    'minor major patch'.split(' ').forEach(function(revision, typeOnly) {
        var tasks = [
            'dist:purge',
            'clean',
            'release:bump:add:commit:' + revision,
            'dist:update',
            'install',
            'dist:persist',
            'release:push:tag:pushTags'
        ];

        grunt.registerTask('deploy' + (typeOnly ? '-' + revision : ''), tasks);
    });

    // dry-run mode to build the distribution content without modifying the source
    grunt.registerTask('dry-run', [
        'dist:purge',
        'clean',
        'dist:update',
        'copy',
        'less:production',
        'less:min',
        //,
        //'requirejs',
        //'uglify'
        'dist:latest'
    ])
};
