const $public = {};

/**
   *
   * @param {number} cardData.card_number     - Number of card.
   * @param {string} cardData.card_name       - Name of card.
   * @param {string} cardData.card_due_date   - Due date of card (format: MM/YYYY).
   * @param {number} cardData.card_cvv        - Cvv of card.
   * @callback {function} createTokenCallback - The callback that handles the response.
   *
   * @example <caption>Example usage of createToken.</caption>
   var createTokenCallback = function (createTokenResponse) {
            console.log(createTokenResponse);
       };
   var cardData = {
         card_number: 4111111111111111,
         card_name: 'Justin Bieber',
         card_due_date: '12/2222',
         card_cvv: 123
        };
   EBANX.card.createToken(cardData, createTokenCallback);
   *
   * @return {object} response object.
   * @type {{createToken}}
   */
$public.createToken = function (cardData, createTokenCallback) {
  const response = {
    data: {},
    error: {},
  };

  const tokenSuccess = function (resp) {
    response.data = resp;

    EBANX.deviceFingerprint.setup(function (deviceId) {
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
    key = EBANX.config.getPublishableKey();
  } catch (e) {
    response.error.err = e;
    createTokenCallback(response);
  }

  EBANX.validator.config.validatePublishableKey(key, function (validatorResponseJson) {
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
      EBANX.validator.card.validate(cardData);
      EBANX.tokenize.card.token(cardData, tokenSuccess, tokenError);
    } catch (e) {
      response.error.err = e;
      createTokenCallback(response);
    }
  });
};

export const card = $public;
