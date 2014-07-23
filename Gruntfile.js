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
      },
      files: [
        'Gruntfile.js',
        'lib/**/*.js'
      ]
    },

    clean: ['tmp', 'dist'],
    
    concat: {
      options: {
        stripBanners: 'all',
        banner: '<%= meta.banner %>\n\n(function (window, undefined) {',
        footer: '\nwindow.Sample = Sample;\n})(window);'
      },

      stable: {
        src: ['<%= build.browser %>'],
        dest: 'dist/sample-<%= pkg.version %>.js'
      },
      
      tests: {
        src: ['<%= build.browser %>', 'tests/**/*.js'],
        dest: 'tmp/tests.js',
        options: {
          banner: '',
          footer: ''
        },          
      },
      
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
    
    simplemocha: {
        options: {
            globals: ['expect'],
            timeout: 3000,
            ignoreLeaks: false,
            ui: 'bdd',
            reporter: 'tap'
        },
        all: { src: ['tmp/tests.js'] }
    },
    
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['tmp/tests.js']
      }
    }
    
    
  });

  this.registerTask('tests', 'concat:tests');

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-mocha-test');
  
  grunt.registerTask('test', 'mochaTest');
  
  grunt.registerTask('stable', [
    'concat:stable',
    'uglify:stable'
  ]);
  
  grunt.registerTask('build', [
    'clean',
    'jshint',
    'tests',
    'test',
    'stable'
  ]);

  grunt.registerTask('default', 'build');	
};