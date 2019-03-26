import json from 'rollup-plugin-json';
import babel from 'rollup-plugin-babel';
import { uglify } from 'rollup-plugin-uglify';

export default {
  input: "src/ebanx.js",
  output: {
    file: "dist/ebanx.js",
    format: "umd",
    name: "EBANX"
  },
  plugins: [
    json(),
    babel({
      babelrc: false,
      presets: ["@babel/env"]
    }),
    uglify()
  ]
}
