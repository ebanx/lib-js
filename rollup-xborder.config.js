import replace from '@rollup/plugin-replace';
import config from './rollup-base.config';
import project from './package.json';

export default {
  ...config,
  output: {
    file: `dist/ebanx-${project.version}.min.js`,
    ...config.output,
  },
  plugins: [
    replace({
      'process.env.EBANX_API_PRODUCTION': JSON.stringify('https://api.ebanxpay.com/'),
      'process.env.EBANX_API_SANDBOX': JSON.stringify('https://sandbox.ebanxpay.com/'),
    }),
    ...config.plugins,
  ],
};
