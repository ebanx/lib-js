var webpack = require('webpack');

module.exports = function(grunt) {

  grunt.initConfig({
    webpack: {
      ebanx: {
        entry: "./src/ebanx.js",
        output: {
          filename: "./dist/ebanx.js",
          library: "EBANX",
          libraryTarget: "umd",
          umdNamedDefine: "true"
        },
        module: {
          loaders: [
            {
              test: /\.js$/,
              exclude: /node_modules/,
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
        files: ['Gruntfile.js', 'src/**/*.js'],
        options: {
          jshintrc: true
        }
    },
  });

  grunt.loadNpmTasks('grunt-webpack');

  grunt.registerTask('default', ['webpack']);
};
