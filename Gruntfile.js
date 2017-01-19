module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today(\"yyyy-mm-dd\") %>*/\n',
        // Task configuration.
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true,
                separator: ';\n'
            },
            app: {
                src: ['node_modules/jquery/dist/jquery.min.js','src/<%= pkg.name %>.js'],
                dest: 'src/concat/<%= pkg.name %>.js'
            }/*,
            css: {
                src: ['sources/scss/app.scss', 'sources/scss/seaff.scss'],
                dest: 'sources/scss/<%= pkg.name %>.scss'
            }*/
        },
        uglify: {
            options: {
                banner: '<%= banner %>'
            },
            app: {
                src: 'src/concat/<%= pkg.name %>.js',
                dest: 'dist/js/<%= pkg.name %>.min.js'
            }
        },
        sass: {
            dist: {
                options:{
                    style:'compressed'
                },
                files: {
                    'dist/css/<%= pkg.name %>.css': 'src/css/<%= pkg.name %>.scss'
                }
            }
        },
        cssmin: {
            target: {
                files: [{
                    expand: true,
                    cwd: 'dist/css',
                    src: ['*.css', '!*.min.css'],
                    dest: 'dist/css',
                    ext: '.min.css'
                }]
            }
        },
        watch: {
            scripts: {
                files: ['src/*.js','index.html'],
                tasks: ['build'],
                options: {
                    spawn: true,
                    event: 'all'
                }
            }
        },
        clean: {
            contents: ['src/concat/*']
        },
        gitcommit: {
            pikl: {
                options: {
                    allowEmpty:true
                },
                files: {
                    src: ['Gruntfile.js','README.md','package.json','index.html','src/pikl.js','src/css/pikl.scss','dist/js/pikl.js','dist/js/pikl.min.js','dist/css/pikl.css','dist/css/pikl.min.css','data/*.json']
                }
            }
        },
        gitpush: {
            pikl: {
                options: {
                    remote:'origin',
                    branch:'master'
                }
            }
        }
    });
    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-git');

    // Default task.
    grunt.registerTask('default', ['concat','sass','cssmin','uglify','clean','gitcommit','gitpush','watch']);
    grunt.registerTask('git', ['gitcommit','gitpush']);
    grunt.registerTask('build', ['concat','sass','cssmin','uglify','clean']);
};