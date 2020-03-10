import { config } from './config';
import { deviceFingerprint } from './fingerprint';
import { tokenize } from './tokenize';
import { validator } from './validator';

export const card = {
  createToken: function (cardData, createTokenCallback) {
    const response = {
      data: {},
      error: {},
    };

    const tokenSuccess = function (resp) {
      response.data = resp;

      deviceFingerprint.setup(function (deviceId) {
        response.data.deviceId = deviceId;

        return createTokenCallback(response);
      });
    };

    const tokenError = function (err) {
      response.error.err = err;

      return createTokenCallback(response);
    };

    let key = '';

    try {
      key = config.getPublishableKey();
    } catch (e) {
      response.error.err = e;
      createTokenCallback(response);
    }

    validator.config.validatePublishableKey(key, function (validatorResponseJson) {
      const validatorResponse = JSON.parse(validatorResponseJson);

      if (!validatorResponse.success) {
        response.error.err = {
          status: 'ERROR',
          status_code: '',
          status_message: validatorResponse.body.error,
        };
        createTokenCallback(response);
        return;
      }

      try {
        validator.card.validate(cardData);
        tokenize.card.token(cardData, tokenSuccess, tokenError);
      } catch (e) {
        response.error.err = e;
        createTokenCallback(response);
      }
    });
  },
};
