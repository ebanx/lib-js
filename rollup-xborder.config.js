import replace from '@rollup/plugin-replace';

import config from './rollup-base.config';
import pkg from './package.json';

export default {
  ...config,
  output: [
    { file: `dist/ebanx-${pkg.version}.min.js`, ...config.output },
    { file: 'dist/ebanx-libjs-latest.min.js', ...config.output },
  ],
  plugins: [
    replace({
      'process.env.EBANX_API_PRODUCTION': JSON.stringify('https://customer.ebanx.com/'),
      'process.env.EBANX_API_SANDBOX': JSON.stringify('https://sandbox.ebanxpay.com/'),
    }),
    ...config.plugins,
  ],
};
