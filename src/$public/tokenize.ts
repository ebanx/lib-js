/* eslint-disable @typescript-eslint/camelcase */
import { http } from './http';
import { config } from './config';
import { utils } from './utils';


export const tokenize = {
  card: {
    token: function (cardData, cb, errorCallback) {
      const tokenResource = EBANX.utils.api.resources.createToken();

      http.ajax
        .request({
          url: tokenResource.url,
          method: tokenResource.method,
          data: JSON.stringify({
            public_integration_key: EBANX.config.getPublishableKey(),
            payment_type_code: utils.creditCardScheme(cardData.card_number),
            country: config.getCountry(),
            card: cardData,
          }),
        })
        .always(function (result) {
          if (result.status === 'ERROR' || !('token' in result)) {
            return errorCallback(result);
          }

          return cb(result);
        });
    },
  },
};
