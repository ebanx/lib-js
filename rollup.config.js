import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import project from './package.json';

export default {
  input: "src/ebanx.js",
  output: {
    file: `dist/ebanx-${project.version}.min.js`,
    format: "umd",
    name: "EBANX"
  },
  plugins: [
    json(),
    babel({
      babelrc: false,
      presets: [
        [
          "@babel/env",
          {
            targets: "> 0.5%, ie >= 10"
          }
        ]
      ]
    }),
    terser()
  ]
};
