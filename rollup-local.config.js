import replace from '@rollup/plugin-replace';

import config from './rollup-base.config';
import pkg from './package.json';

export default {
  ...config,
  output: [
    { file: `dist/ebanxpay-${pkg.version}.min.js`, ...config.output },
    { file: 'dist/ebanxpay-libjs-latest.min.js', ...config.output },
  ],
  plugins: [
    replace({
      'process.env.EBANX_API_PRODUCTION': JSON.stringify('https://api.ebanx.com.br/'),
      'process.env.EBANX_API_SANDBOX': JSON.stringify('https://staging.ebanx.com.br/'),
    }),
    ...config.plugins,
  ],
};
