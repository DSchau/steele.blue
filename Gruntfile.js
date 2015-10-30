/*global module:false*/
module.exports = function(grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    config: {
      root: 'blog',
      site: '<%= config.root %>/_site'
    },
    babel: {
      options: {
        sourceMap: true
      },
      exampleJs: {
        files: {
          '<%= config.site %>/tmp/js/page.js' : '<%= config.root %>/_assets/js/page.es6'
        }
      }
    },
    copy: {
      cssIncludes: {
        files: [
          {'<%= config.root %>/_includes/css-includes.css' : '<%= config.root %>/_site/tmp/css/main.css'}
        ]
      },
      maps: {
        files: {
          '<%= config.root %>/_site/main.css.map' : '<%= config.root %>/_site/tmp/css/main.css.map'
        }
      }
    },
    shell: {
      build: {
        command: 'jekyll build',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= config.root %>'
          }
        }
      },
      jekyll: {
        command: 'jekyll build --drafts',
        options: {
          stdout: true,
          execOptions: {
            cwd: '<%= config.root %>'
          }
        }
      }
    },
    watch: {
      content: {
        files: ['<%= config.root %>/_drafts/**/*', '<%= config.root %>/_posts/**/*', '<%= config.root %>/_layouts/**/*', '<%= config.root %>/index.html', '<%= config.root %>/_assets/**'],
        tasks: ['content']
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 4000,
          base: '<%= config.site %>'
        }
      }
    },
    sass: {
      options: {
        sourceMap: true,
        sourceMapContents: true,
        outputStyle: 'compressed',
        includePaths: [
          '<%= config.root %>/_site/tmp/css/',
          '<%= config.root %>/_assets/css/',
        ]
      },
      assets: {
        files: [{
          expand: true,
          cwd: '<%= config.root %>/_assets/css',
          src: '*.scss',
          dest: '<%= config.root %>/_site/tmp/css',
          ext: '.css'
        }]
      }
    },
    clean: {
      tmp: ['<%= config.root %>/_site/tmp']
    },
    concat: {
      options: {
        sourceMap: true
      },
      js: {
        src: [
          'node_modules/fontfaceobserver/fontfaceobserver.js',
          'node_modules/picturefill/dist/picturefill.js',
          '<%= config.site %>/tmp/js/*.js',
          '<%= config.root %>/_assets/js/*.js'
        ],
        dest: '<%= config.root %>/_site/js/app.src.js'
      }
    },
    cssmin: {
      options: {
        sourceMap: true
        // Doesn't work yet, see https://github.com/jakubpawlowicz/clean-css/issues/397
        // sourceMap: '<%= concat.css.dest %>.map'
      },
      css: {
        files: {
          '<%= config.root %>/_site/css/main.css' : '<%= concat.css.dest %>'
        }
      }
    },
    uglify: {
      options: {
        sourceMap: true,
        sourceMapIn: '<%= concat.js.dest %>.map',
        sourceMapIncludeSources: true
      },
      js: {
        files: {
          '<%= config.root %>/_site/js/app.js' : '<%= concat.js.dest %>'
        }
      }
    },
    autoprefixer: {
      options: {
        map: true
      },
      generated: {
        src: '<%= config.root %>/_site/tmp/css/main.css',
        dest: '<%= config.root %>/_site/tmp/css/main.css'
      }
    },
    aws: grunt.file.readJSON('grunt-aws.json'),
    s3: {
      options: {
        accessKeyId: '<%= aws.key %>',
        secretAccessKey: '<%= aws.secret %>',
        region: '<%= aws.region %>',
        bucket: '<%= aws.bucket %>',
        access: 'public-read',
        cache: true,
        cacheTTL: 60*60*1000,
        meta: {
          'X-i-live-in' : 'Omaha',
        },
      },
      build: {
        cwd: '<%= config.root %>/_site',
        src: '**'
      }
    },
  });

  // These plugins provide necessary tasks.
  // Default task.
  grunt.registerTask('default', ['content']);
  grunt.registerTask('css', ['sass:assets', 'autoprefixer', 'copy:cssIncludes']);
  grunt.registerTask('js', ['babel', 'concat:js', 'uglify']);
  grunt.registerTask('content', ['shell:jekyll', 'css', 'js', 'copy:maps', 'clean:tmp']);
  grunt.registerTask('build', ['shell:build', 'css', 'js', 'copy:maps', 'clean:tmp']);
  grunt.registerTask('serve', ['content', 'connect:server', 'watch']);
  grunt.registerTask('deploy', ['build', 's3']);

};
