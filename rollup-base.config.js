import { eslint } from 'rollup-plugin-eslint';
import { terser } from 'rollup-plugin-terser';
import copy from 'rollup-plugin-copy';
import html from 'rollup-plugin-generate-html-template';
import json from '@rollup/plugin-json';
import license from '@rollup/plugin-replace';
import typescript from 'rollup-plugin-typescript2';

export default {
  input: 'src/index.ts',
  output: {
    format: 'umd',
    name: 'EBANX',
    sourcemap: true,
  },
  plugins: [
    eslint(),
    typescript(),
    json(),
    terser(),
    html({
      template: 'src/index.html',
      target: 'index.html',
    }),
    copy({
      targets: [
        { src: 'assets/**/*', dest: 'dist' },
      ],
    }),
    license({
      banner: {
        file: 'LICENSE.md',
      },
    }),
    license({
      banner: {
        file: 'BANNER.md',
      },
    }),
  ],
};
