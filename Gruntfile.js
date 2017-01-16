module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        // Metadata.
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
                    'dist/css/app.css': 'sources/scss/<%= pkg.name %>.scss'
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
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-sass');

    // Default task.
    grunt.registerTask('default', ['concat'/*,'sass','cssmin'*/,'uglify','clean','watch']);
    grunt.registerTask('build', ['concat','uglify','clean']);
};