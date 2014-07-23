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
        footer: '\n})(window);'
      },

      stable: {
        src: ['<%= build.browser %>'],
        dest: 'dist/sample-<%= pkg.version %>.js'
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  
  grunt.registerTask('build', [
    'concat:stable',
//  'uglify:stable'
  ]);

  grunt.registerTask('default', 'jshint');	
};