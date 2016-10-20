var webpack = require('webpack');

module.exports = function(grunt) {

  grunt.initConfig({
    jsdoc : {
      dist : {
        src: ['src/*.js', 'test/*.js'],
        options: {
          destination: 'doc'
        }
      }
    },
    webpack: {
      ebanx: {
        entry: "./src/ebanx.js",
        output: {
          filename: "./dist/ebanx.js",
          library: "Ebanx",
          libraryTarget: "umd",
          umdNamedDefine: "true"
        },
        module: {
          preLoaders: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
              loader: "jshint-loader"
            }
          ],
          loaders: [
            {
              test: /\.js$/,
              exclude: /(node_modules|bower_components)/,
              loader: 'babel',
              query: {
                presets: ['es2015']
              }
            }
          ]
        },
        plugins: [
          new webpack.optimize.UglifyJsPlugin()
        ]
      }
    },
    jshint: {
        files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
        options: {
          jshintrc: true
        }
    },
    // watch: {
    //   files: ['<%= jshint.files %>'],
    //   tasks: ['webpack', 'jshint']
    // },
    mochaTest: {
      test: {
        options: {
          reporter: 'spec',
          captureFile: 'results.txt',
          quiet: false,
          clearRequireCache: false,
          noFail: false
        },
        src: ['test/mochajs/*.js']
      }
    },
    nightwatchjs: {},
    connect: {
      testServer: {
        options: {
          port: 8080,
          base: './test/nightwatch/html'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-nightwatchjs');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');

  // TASKS
  grunt.registerTask('default', ['webpack']);

  grunt.registerTask('doc', ['jsdoc']);

  grunt.registerTask('test', ['jshint', 'mochaTest', 'nightwatchjs:test']);
  grunt.registerTask('test-mocha', ['jshint', 'mochaTest']);
  grunt.registerTask('test-nightwatch', ['jshint', 'connect', 'nightwatchjs:test']);

};