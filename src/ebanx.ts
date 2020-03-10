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

EBANX.tokenize = (function () {
  return {
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
})();


/**
 * Public module Card payment method of EBANX
 * @module EBANX/card
 * @public
 */
EBANX.card = (function () {
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

  return $public;
})();

EBANX.deviceFingerprint = {
  ebanxSessionId: null,
  providerSessionList: [],
  postProvidersRemaining: 0,
  onSuccessCallback: null,
  onErrorCallback: null,

  setup: function (onSuccess, onError) {
    this.onSuccessCallback = onSuccess || console.log;
    this.onErrorCallback = onError || console.error;

    this.getList(function (providersList) {
      try {
        if (!providersList) throw new Error('EBANX.deviceFingerprint.setup - providersList is missing');
        if (!providersList.ebanx_session_id) throw new Error('EBANX.deviceFingerprint.setup - ebanx_session_id is missing');

        if (!providersList.providers || !providersList.providers.length) {
          return this.onSuccessCallback(providersList.ebanx_session_id);
        }

        this.ebanxSessionId = providersList.ebanx_session_id;
        // This variable is duplicated for compatibility with providers scripts
        this.ebanx_session_id = this.ebanxSessionId;
        this.postProvidersRemaining = providersList.providers.length;

        providersList.providers.forEach(function (provider) {
          this.loadProvider(provider, this.saveProviderSessionList.bind(this));
        }.bind(this));
      } catch (e) {
        this.onErrorCallback(e);
      }
    }.bind(this));
  },

  getList: function (cb) {
    EBANX.http.ajax
      .request({
        url: EBANX.utils.api.resources.fingerPrintResource().url,
        data: {
          publicIntegrationKey: EBANX.config.getPublishableKey(),
          country: EBANX.config.getCountry(),
        },
      })
      .always(cb);
  },

  saveProviderSessionList: function (providerSession) {
    this.postProvidersRemaining--;
    this.providerSessionList.push(providerSession);

    if (!this.postProvidersRemaining) {
      this.postProviderSessionList();
    }
  },

  postProviderSessionList: function () {
    const ebanxSessionId = this.ebanxSessionId;
    const providersSessionList = this.providerSessionList;
    const onSuccessCallback = this.onSuccessCallback;
    const onErrorCallback = this.onErrorCallback;

    this.ebanxSessionId = null;
    this.providerSessionList = [];
    this.onSuccessCallback = null;
    this.onErrorCallback = null;

    const data = {
      publicIntegrationKey: EBANX.config.getPublishableKey(),
      ebanx_session_id: ebanxSessionId,
      providers: providersSessionList,
    };

    const resource = EBANX.utils.api.resources.fingerPrintProvidersResource();

    EBANX.http.ajax
      .request({
        url: resource.url,
        method: resource.method,
        data: data,
      })
      .always(function (data, xhr) {
        if (xhr.status == 200) {
          onSuccessCallback(ebanxSessionId);
        } else {
          onErrorCallback(new Error('postProviderSessionList - xhr.status != 200, received value: ' + xhr.status));
        }
      });
  },

  loadProvider: function (data, cb) {
    EBANX.http.injectJS(data.source, function () {
      EBANX.deviceFingerprint[data.provider].setup(data.settings, function (sessionId) {
        cb({
          provider: data.provider,
          session_id: sessionId,
        });
      });
    });
  },
};

export default EBANX;
