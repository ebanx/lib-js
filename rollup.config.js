import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";

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
