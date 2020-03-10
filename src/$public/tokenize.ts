export const tokenize = {
  card: {
    token: function (cardData, cb, errorCallback) {
      const tokenResource = EBANX.utils.api.resources.createToken();

      EBANX.http.ajax.request({
        url: tokenResource.url,
        method: tokenResource.method,
        data: JSON.stringify({
          public_integration_key: EBANX.config.getPublishableKey(),
          payment_type_code: EBANX.utils.creditCardScheme(cardData.card_number),
          country: EBANX.config.getCountry(),
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
