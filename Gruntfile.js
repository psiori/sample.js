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
        'lib/**/*.js',
        'tests/**/*.js'
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
      test: {
        src: ['tests/**/*.html'],
        options: {
          run: false,
          reporter: 'Spec'
        }
      },
    },
    
    blanket_mocha: {
      test: {
        src: ['tests/**/*.html'],
        options : {
          threshold : 20
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
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-shell');
  
  grunt.registerTask('test', 'mocha');
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

  grunt.registerTask('default', 'build');	
};