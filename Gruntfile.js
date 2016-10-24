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
    qunit: {
      all: {
        options: {
          urls: [
            'http://localhost:8000/test/qunit/integration/card/create-token.html'
          ]
        }
      }
    },
    connect: {
      server: {
        options: {
          port: 8000,
          base: '.'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-jsdoc');
  grunt.loadNpmTasks('grunt-webpack');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-connect');

  grunt.registerTask('doc', ['jsdoc']);
  grunt.registerTask('test', ['connect', 'qunit']);
  grunt.registerTask('default', ['webpack', 'connect', 'qunit']);
};