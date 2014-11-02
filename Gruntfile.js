module.exports = function(grunt) {

  grunt.initConfig({
    build: grunt.file.readYAML('build/build.yml'),  
    pkg:   grunt.file.readJSON('package.json'),
    meta: {
      license: '<%= pkg.license %>',
      copyright: 'Copyright (c) 2014-<%= grunt.template.today("yyyy") %>',
      banner:
        '/*!\n' +
        ' * <%= pkg.name %> - <%= pkg.description %> v<%= pkg.version %>\n' +
        ' * <%= pkg.homepage %>\n' +
        ' *\n' +
        ' * <%= meta.copyright %>, <%= pkg.author %>\n' +
        ' * Licensed under the <%= meta.license %> License.\n' +
        ' *\n' +
        ' */\n\n'
    },

    jshint: {
      options: {
        es3: true,
        curly: true,
        eqeqeq: true,
        forin: true,
        freeze: true,
        indent: 2,
        latedef: "nofunc",
        noempty: true,
        nonbsp: true,
        maxdepth: 3,
        maxlen: 120
      },
      use_defaults: [
        'Gruntfile.js',
        'lib/**/*.js'
      ],
      with_overrides: {
        options: {
          expr: true     // allow expressions to pass           
        },
        files: {
          src: [ 'tests/**/*.js' ]
        }
      },
      
      jenkins: {
        options: {
          es3: true,
          curly: true,
          eqeqeq: true,
          forin: true,
          freeze: true,
          indent: 2,
          latedef: "nofunc",
          noempty: true,
          nonbsp: true,
          maxdepth: 3,
          maxlen: 120,
          reporter: 'checkstyle',
          reporterOutput: 'tmp/checkstyle-result.xml'
        },
        use_defaults: [
          'Gruntfile.js',
          'lib/**/*.js'
        ],
        with_overrides: {
          options: {
            expr: true     // allow expressions to pass           
          },
          files: {
            src: [ 'tests/**/*.js' ]
          }
        }
      }
    },

    clean: ['tmp'],
    
    concat: {
      options: {
        stripBanners: 'all',
        banner: '<%= meta.banner %>\n\n(function (window, undefined) {',
        footer: '\nwindow.Sample = Sample;\n})(window);'
      },

      stable: {
        src: ['<%= build.browser %>'],
        dest: 'dist/sample-<%= pkg.version %>.js'
      }
      
    },
    
    uglify: {
      options: {
        banner: '<%= meta.banner %>',
        mangle: true
      },
      
      stable: {
        src: ['<%= concat.stable.dest %>'],
        dest: 'dist/sample-<%= pkg.version %>.min.js'
      }
    },
    
    mocha_phantomjs: {
      test: {
        src: ['tests/**/*.html'],
        options: {
          reporter: 'spec',
          setting: ["localToRemoteUrlAccessEnabled=true", "web-security=false"]
        }
      },
      jenkins: {
        src: ['tests/**/*.html'],
        options: {
          output: 'tmp/test-result.xml',
          reporter: 'xunit',
          setting: ["localToRemoteUrlAccessEnabled=true", "web-security=false"]
        }
      }
    },
    
    blanket_mocha: {
      test: {
        src: ['tests/**/*.html'],
        options : {
          threshold : 50,
          globalThreshold : 90,
          page: { 
            // inject arguments into PhantomJS page.settings object
            // found here: https://github.com/kmiyashiro/grunt-mocha
            // would work in grunt-mocha, but not in grunt-blanket-mocha :(
            settings: {
              localToRemoteUrlAccessEnabled: true,
              webSecurity: false
            }
          },
          log: true,
          logErrors: true
        }
      }
    }
    
  });
  
  this.registerTask('browsertest-server', [
    'shell:browsertest-server'
  ]);
  

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-blanket-mocha');
  grunt.loadNpmTasks('grunt-mocha-phantomjs');
  grunt.loadNpmTasks('grunt-mocha-require-phantom');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-shell');
  
  grunt.registerTask('test', 'mocha_phantomjs:test');
  grunt.registerTask('test-jenkins', 'mocha_phantomjs:jenkins');
  grunt.registerTask('test-coverage', 'blanket_mocha');
    
  grunt.registerTask('stable', [
    'concat:stable',
    'uglify:stable'
  ]);
  
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'test',
    'stable'
  ]);
  
  grunt.registerTask('jenkins', [
    'clean',
    'jshint:jenkins',
    'test-jenkins',
    'stable'
  ]);

  grunt.registerTask('default', 'build');	
};