import json from "rollup-plugin-json";
import babel from "rollup-plugin-babel";
import { terser } from "rollup-plugin-terser";
import license from "rollup-plugin-license";

export default {
  input: "src/ebanx.js",
  output: {
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
    terser(),
    license({
      banner: {
        file: 'LICENSE.md',
      }
    }),
    license({
      banner: {
        file: 'BANNER.md',
      }
    }),
  ]
};
