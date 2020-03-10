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


EBANX.http = (function () {
  return {
    normalize: {
      q: function (obj, urlEncode) {
        function flattenObj(x, path) {
          const result = [];

          path = path || [];
          Object.keys(x).forEach(function (key) {
            if (!x.hasOwnProperty(key)) return;

            const newPath = path.slice();
            newPath.push(key);

            let vals = [];
            if (typeof x[key] == 'object') {
              vals = flattenObj(x[key], newPath);
            } else {
              vals.push({ path: newPath, val: x[key] });
            }
            vals.forEach(function (obj) {
              return result.push(obj);
            });
          });

          return result;
        }

        let parts = flattenObj(obj);

        parts = parts.map(function (varInfo) {
          if (varInfo.path.length == 1) varInfo.path = varInfo.path[0]; else {
            const first = varInfo.path[0];
            const rest = varInfo.path.slice(1);
            varInfo.path = first + '[' + rest.join('][') + ']';
          }
          return varInfo;
        });

        const queryString = parts.map(function (varInfo) {
          return varInfo.path + '=' + varInfo.val;
        }).join('&');
        if (urlEncode)
          return encodeURIComponent(queryString);
        else
          return queryString;
      },
    },
    ajax: {
      request: function (ops) {
        if (typeof ops == 'string')
          ops = { url: ops };

        ops.url = ops.url || '';
        ops.method = ops.method || 'get';
        ops.data = ops.data || {};

        const api = {
          /* jshint expr: true */
          host: {},
          process: function (ops) {
            const self = this;
            this.xhr = null;

            if (window.ActiveXObject) {
              this.xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
            } else if (window.XMLHttpRequest) {
              this.xhr = new XMLHttpRequest();
            }

            if (this.xhr) {
              this.xhr.onreadystatechange = function () {
                if (self.xhr.readyState == 4) {
                  let result = self.xhr.responseText || '{}';

                  if (typeof ops.raw == 'undefined' && typeof JSON !== 'undefined') {
                    result = JSON.parse(result);
                  }

                  self.alwaysCallback && self.alwaysCallback.apply(self.host, [result, self.xhr]);
                }
              };
            }

            if (ops.method.toUpperCase() == 'GET') {
              ops.url += '?' + EBANX.http.normalize.q(ops.data);
              delete ops.data;
            }

            this.xhr.open(ops.method.toUpperCase(), ops.url, true);

            setTimeout(function () {
              self.xhr.send(ops.data);
            }, 20);

            return this;
          },
          always: function (callback) {
            this.alwaysCallback = callback;
            return this;
          },
        };
        return api.process(ops);
      },
    },
    injectJS: function (src, cb) {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.onload = cb;
      s.src = src;
      document.getElementsByTagName('head')[0].appendChild(s);
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
