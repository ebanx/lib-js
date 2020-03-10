import { config } from './config';
import { errors } from './errors';
import { validator } from './validator';

export const utils = {
  api: {
    url: function () {
      return utils.api.path() + 'ws';
    },
    path: function () {
      return (config.isLive() ? process.env.EBANX_API_PRODUCTION : process.env.EBANX_API_SANDBOX);
    },
    resources: {
      createToken: function () {
        return {
          url: utils.api.url() + '/token',
          method: 'post',
        };
      },
      validPublicIntegrationKey: function () {
        return {
          url: utils.api.url() + '/merchantIntegrationProperties/isValidPublicIntegrationKey',
          method: 'get',
        };
      },
      fingerPrintResource: function () {
        return {
          url: utils.api.path() + 'fingerprint/',
          method: 'get',
        };
      },
      fingerPrintProvidersResource: function () {
        return {
          url: utils.api.path() + 'fingerprint/provider',
          method: 'get',
        };
      },
    },
  },
  availableCountries: ['br', 'mx', 'co', 'ar', 'pe', 'cl', 'ec', 'bo'].join(', '),
  creditCardScheme: function (cardNumber: string) {
    validator.card.validateNumber(cardNumber);

    const schemes = {
      br: {
        aura: /^50[0-9]{14,17}$/,
        elo: /^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)/,
        diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        hipercard: /^(38|60)[0-9]{11,17}$/,
      },
      mx: {
        carnet: /^5[0-9][0-9]{14}$/,
        mastercard__2: /^2[2-7][0-9]{14}$/,
      },
      co: {
        diners: /^36[0-9]{12}$/,
      },
      ar: {
        mastercard__all: /^[0-9]{16}$/,
      },
      cl: {
        magna: /^(568009)/,
      },
      all: {
        amex: /^3[47][0-9]{13}$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
      },
    };

    const localSchemes = {};
    for (var prop in schemes[EBANX.config.getCountry()]) {
      localSchemes[prop] = schemes[EBANX.config.getCountry()][prop];
    }
    for (var prop in schemes.all) {
      localSchemes[prop] = schemes.all[prop];
    }

    for (const scheme in localSchemes) {
      if (!localSchemes[scheme].test(cardNumber))
        continue;

      let result = scheme;
      const separatorIndex = scheme.indexOf('__');
      if (separatorIndex !== -1) {
        result = scheme.substr(0, separatorIndex);
      }

      return result;
    }

    throw new errors.InvalidValueFieldError('BP-DR-S-75', 'card_number');
  },
};
