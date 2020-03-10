import { $public } from './$public';

/**
 * @module EBANX
 * @global
 */
const EBANX = (function () {
  if ($public.config.isLive() && location.protocol !== 'https:') {
    throw 'EBANXInvalidConfigurationError: Your protocol needs to be https.';
  }

  return $public;
})();


export default EBANX;
