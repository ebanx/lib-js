
import { terser } from "rollup-plugin-terser";
import json from '@rollup/plugin-json';
import license from "@rollup/plugin-replace";
import typescript from 'rollup-plugin-typescript2';

import pkg from './package.json';

export default {
  input: "src/index.ts",
  output: {
    format: "umd",
    name: "EBANX"
  },
  plugins: [
    typescript(),
    json(),
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
