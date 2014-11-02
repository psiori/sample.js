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
    
    mocha: {
      options: {
        page: { 
          // inject arguments into PhantomJS page.settings object
          // found here: https://github.com/kmiyashiro/grunt-mocha
          // would work in grunt-mocha, but not in grunt-blanket-mocha :(
          settings: {
            localToRemoteUrlAccessEnabled: true,
            webSecurityEnabled: false
          }
        }        
      },
      test: {
        src: ['tests/**/*.html'],
        options: {
          reporter: 'Spec',
          log: true,
          logErrors: true
        }
      },
      jenkins: {
        src: ['tests/**/*.html'],
        dest: 'tmp/test-result.xml',
        options: {
          reporter: 'XUnit'
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
            // this is the same trick as above. since unfortunately
            // grunt-blanket-mocha didn't pull the solution to set
            // page properties as grunt-mocha did, we created a 
            // local fork (https://github.com/wackadoo/grunt-blanket-mocha),
            // solved the issue there and posted a pull request to
            // grunt-blanket-mocha. Until they merged our solution or
            // solved the problem otherwise, we'll need our locally
            // modified version.
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
  grunt.loadNpmTasks('grunt-mocha-require-phantom');
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-shell');
  
  grunt.registerTask('test', 'mocha:test');
  grunt.registerTask('test-jenkins', 'mocha:jenkins');
  grunt.registerTask('test-coverage', 'blanket_mocha');
    
  grunt.registerTask('stable', [
    'concat:stable',
    'uglify:stable'
  ]);
  
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'test',
    'test-coverage',
    'stable'
  ]);
  
  grunt.registerTask('jenkins', [
    'clean',
    'jshint:jenkins',
    'test-jenkins',
    'test-coverage',
    'stable'
  ]);

  grunt.registerTask('default', 'build');	
};