/**
 * @module EBANX
 * @global
 */
const EBANX = (function () {
  const $public = {};
  const _private = {
    country: '',
    mode: 'test',
    publicKey: ''
  };

  $public.config = (function() {
    return {
      isLive: function () {
        return _private.mode === 'production';
      },
      setPublishableKey: function (key) {
        _private.publicKey = String(key);
      },
      setCountry: function (country) {
        EBANX.validator.config.validateCountry(country);

        _private.country = String(country);
      },
      setMode: function (mode) {
        EBANX.validator.config.validateMode(mode);

        _private.mode = mode;
      },
      getMode: function () {
        return _private.mode;
      },
      getPublishableKey: function () {
        if (_private.publicKey.trim() === '')
          throw new EBANX.errors.InvalidConfigurationError('Missing publishable key. You need set publishable key using the method EBANX.config.setPublishableKey.', 'publicKey');

        return _private.publicKey;
      },
      getCountry: function () {
        if (!_private.country) {
          _private.country = 'br';
        }

        return _private.country;
      },
      getLocale: function () {
        const countryLocale = {
          'br': 'pt_BR',
          'mx': 'es',
          'co': 'es'
        };

        return countryLocale[EBANX.config.getCountry()];
      }
    };
  })();

  if ($public.config.isLive() && location.protocol !== 'https:') {
    throw 'EBANXInvalidConfigurationError: Your protocol needs to be https.';
  }

  return $public;
})();

EBANX.errors = (function () {
  return {
    summary: {
      'pt_BR': {
        'BP-DR-76': `País não informado.`,
        'BP-DR-77': `País não permitido.`,
        'BP-DR-75': 'O número do cartão de crédito é inválido.',
        'BP-DR-S-75': 'A bandeira do cartão de crédito é inválida.',
        'BP-DR-51': 'Insira o nome que está impresso no cartão de crédito.',
        'BP-DR-55': 'O código do cartão de crédito é inválido.',
        'BP-DR-57': 'A data do cartão de crédito deve estar no formato mes/ano, por exemplo, 12/2020.',
        'BP-DR-M-57': 'O mês data do cartão de crédito é inválido.',
        'BP-DR-Y-57': 'O ano data do cartão de crédito é inválido.'
      },
      'es': {
        'BP-DR-76': `País não informado.`,
        'BP-DR-77': `País não permitido.`,
        'BP-DR-75': 'El número de tarjeta de crédito es inválido.',
        'BP-DR-S-75': 'El bandera de tarjeta de crédito es inválido.',
        'BP-DR-51': 'Por favor, introduce el nombre como está en tu tarjeta de crédito.',
        'BP-DR-55': 'El código de tarjeta de crédito es inválido.',
        'BP-DR-57': 'Por favor, escribe la fecha en el formato MM/AAAA.',
        'BP-DR-M-57': 'El mes de tarjeta de crédito es inválido.',
        'BP-DR-Y-57': 'El año de tarjeta de crédito es inválido.'
      }
    },
    InvalidValueFieldError: function (message, field) {
      this.message = EBANX.errors.summary[EBANX.config.getLocale()][message] || message;
      this.field = field;
      this.name = 'InvalidValueFieldError';
    },
    InvalidConfigurationError: function (message, config) {
      this.message = EBANX.errors.summary[EBANX.config.getLocale()][message] || message;
      this.invalidConfiguration = config;
      this.name = 'InvalidConfigurationError';
    }
  };
})();

/**
 * Protected module validator - utils to validate objects data
 * @module EBANX/validator
 * @namespace EBANX/validator
 * @protected
 */
EBANX.validator = (function () {
  const cachedResults = {
    publicKey: {}
  };

  return {
    /**
     * @memberof EBANX/validator
     * @inner
     * @type {Object}
     */
    config: {
      /**
       * Validate if the publishable key is validator
       * @param  {string}   key The publishable merchant key
       * @param  {Function} cb  The callback
       * @return {void}
       */
      validatePublishableKey: function (key, cb) {
        const publicKeyResource = EBANX.utils.api.resources.validPublicIntegrationKey();

        if (cachedResults.publicKey[key]) {
          cb(cachedResults.publicKey[key]);
          return;
        }

        EBANX.http.ajax
          .request({
            url: publicKeyResource.url,
            method: publicKeyResource.method,
            data: {
              public_integration_key: key
            }
          })
          .always(function (res) {
            cachedResults.publicKey[key] = res;
            cb(res);
          });
      },
      /**
       *
       * @function validateCountry - validate the transaction country
       * @param {string} country - transaction country to validate
       * @throws {EBANX.errors.InvalidValueFieldError} case country is not valid
       *
       * @return {void}
       */
      validateCountry: function (country) {
        if (EBANX.utils.availableCountries.indexOf(country) === -1) {
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-77', 'country');
        }
      },
      /**
       * Validate if mode is "test" or "production"
       * @param  {string} mode The mode
       * @throws {EBANX.errors.InvalidConfigurationError} case the test mode is invalid
       * @return {void}
       */
      validateMode: function (mode) {
        if (mode.match(/^(test|production)$/) === null) {
          throw new EBANX.errors.InvalidConfigurationError('Invalid mode, please, use "test" or "production" as test mode.', 'mode');
        }
      }
    },
    /**
     * Card object validator in EBANX/validator~card.
     *
     * @memberof EBANX/validator
     * @inner
     */
    card: {
      /**
       *
       * @function validateNumber - validate a card number
       * @param {number} number - Number of card to validate.
       * @throws {EBANX.errors.InvalidValueFieldError} case card number is not valid
       *
       * @return {void}
       */
      validateNumber: function (number) {
        var regex = /^3[47][0-9]{13}$|^50[0-9]{14,17}$|^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)|^3(?:0[0-5]|[68][0-9])[0-9]{11}$|^6(?:011|5[0-9]{2})[0-9]{12}$|^(38|60)[0-9]{11,17}$|^5[1-5][0-9]{14}$|^4[0-9]{12}(?:[0-9]{3})?$/;
        if (!regex.test(number) || !this.luhnAlgCheck(String(number)))
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-75', 'card_number');
      },
      /**
       * @function validateName - validate the credit card name
       * @param  {string} name Name of the credit card
       * @throws {EBANX.errors.InvalidValueFieldError} case name isn't string and doesn't have length
       *
       * @return {void}
       */
      validateName: function (name) {
        if (typeof name !== 'string' || name.length === 0 || name.match(/[0-9]+/) !== null) {
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-51', 'card_name');
        }
      },
      /**
       *
       * @function luhnAlgCheck - luhn algorithm
       * @see https://en.wikipedia.org/wiki/Luhn_algorithm
       * @param {string} cardNumber - Number of card to apply alg.
       *
       * @return {boolean} true if valid false if not valid
       */
      luhnAlgCheck: function(cardNumber) {
        /* jshint expr: true */
        var b,c,d,e;
        for(d = +cardNumber[b = cardNumber.length-1], e=0; b--;)
          c = +cardNumber[b], d += ++e % 2 ? 2 * c % 10 + (c > 4) : c;
        return (d%10) === 0;
      },
      /**
       *
       * @function validateCvv - validate a card cvv
       * @param {number} cvv - Cvv of card to validate.
       * @throws {EBANX.errors.InvalidValueFieldError} case card cvv is not valid
       *
       * @return {void}
       */
      validateCvv: function (cvv) {
        var regex = new RegExp('^[0-9]{3,4}$');
        if (!String(cvv).match(regex)) {
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-55', 'card_cvv');
        }
      },
      /**
       *
       * @function validateDueDate - validate a card due date
       * @param {string} dueDate - Due date of card to validate.
       * @throws {EBANX.errors.InvalidValueFieldError} case card due date is not valid
       * @throws {EBANX.errors.InvalidValueFieldError} case card due date year is not valid
       * @throws {EBANX.errors.InvalidValueFieldError} case card due date month is not valid
       *
       * @return {void}
       */
      validateDueDate: function (dueDate) {
        var date = (dueDate + '').split('/');

        date = {
          now: new Date(),
          year: date[1],
          month: date[0]
        };

        if (((/^\d+$/).test(date.month)) !== true || (parseInt(date.month, 10) <= 12) !== true) {
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-M-57', 'card_due_date');
        }
        if (!(/^\d+$/).test(date.year)) {
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-Y-57', 'card_due_date');
        }

        date.expiration = new Date(date.year, date.month);

        date.expiration.setMonth(date.expiration.getMonth() - 1);
        date.expiration.setMonth(date.expiration.getMonth() + 1, 1);

        if ((date.expiration > date.now) !== true) {
          throw new EBANX.errors.InvalidValueFieldError('BP-DR-57', 'card_due_date');
        }
      },
      /**
       *
       * @function validate - validate card data
       * @param {object} cardData - All data of card.
       * @param {number} cardData.card_number   - Number of card.
       * @param {string} cardData.card_name     - Name of card.
       * @param {string} cardData.card_due_date - Due date of card (format: MM/YYYY).
       * @param {number} cardData.card_cvv      - Cvv of card.
       *
       * @return {void}
       */
      validate: function (cardData) {
        this.validateName(cardData.card_name);
        this.validateNumber(cardData.card_number);
        this.validateDueDate(cardData.card_due_date);
        this.validateCvv(cardData.card_cvv);
      }
    }
  };
})();

EBANX.tokenize = (function () {
  return {
    card: {
      token: function (cardData, cb, errorCallback) {
        const tokenResource = EBANX.utils.api.resources.createToken();

        EBANX.http.ajax.request({
          url: tokenResource.url,
          method: tokenResource.method,
          json: true,
          data: {
            request_body: JSON.stringify({
              public_integration_key: EBANX.config.getPublishableKey(),
              payment_type_code: EBANX.utils.creditCardScheme(cardData.card_number),
              country: EBANX.config.getCountry(),
              card: cardData
            })
          }
        })
          .always(function(result) {
            if (result.status === 'ERROR' || !('token' in result)) {
              return errorCallback(result);
            }

            return cb(result);
          });
      }
    }
  };
})();

/**
 * Public Utils Module
 * @module EBANX/utils
 * @public
 */
EBANX.utils = (function () {
  const utilsModule = {
    api: {
      path: () => {
        return (EBANX.config.isLive() ? 'https://api.ebanx.com/' : 'https://sandbox.ebanx.com/');
      }
    },
    availableCountries: ['br', 'mx', 'co'].join(', '),
    creditCardScheme: function (cardNumber) {
      EBANX.validator.card.validateNumber(cardNumber);

      let schemes = {
        br: {
          amex: /^3[47][0-9]{13}$/,
          aura: /^50[0-9]{14,17}$/,
          elo: /^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)/,
          diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
          discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
          hipercard: /^(38|60)[0-9]{11,17}$/
        },
        mx: {
          carnet: /^5[6-9][0-9]{14}$/,
          mastercard__2: /^2[2-7][0-9]{14}$/
        },
        co: {
          amex: /^3[47][0-9]{13}$/,
          diners: /^36[0-9]{12}$/
        },
        all: {
          mastercard: /^5[1-5][0-9]{14}$/,
          visa: /^4[0-9]{12}(?:[0-9]{3})?$/
        }
      };

      let localSchemes = Object.assign({}, schemes[EBANX.config.getCountry()], schemes.all);

      for (let scheme in localSchemes) {
        if (!localSchemes[scheme].test(cardNumber))
          continue;

        let result = scheme;
        let separatorIndex = scheme.indexOf('__');
        if (separatorIndex !== -1) {
          result = scheme.substr(0, separatorIndex);
        }

        return result;
      }

      throw new EBANX.errors.InvalidValueFieldError('BP-DR-S-75', 'card_number');
    }
  };

  utilsModule.api.url = () => {
    return utilsModule.api.path() + 'ws';
  };

  utilsModule.api.resources = {
    createToken: () => {
      return {
        url: `${utilsModule.api.url()}/token`,
        method: 'get'
      };
    },
    validPublicIntegrationKey: () => {
      return {
        url: `${utilsModule.api.url()}/merchantIntegrationProperties/isValidPublicIntegrationKey`,
        method: 'get'
      };
    },
    fingerPrintResource: () => {
      return {
        url: `${utilsModule.api.path()}fingerprint/`,
        method: 'get'
      };
    },
    fingerPrintProvidersResource: () => {
      return {
        url: `${utilsModule.api.path()}fingerprint/provider`,
        method: 'post'
      };
    }
  };

  return utilsModule;
})();


EBANX.http = (function () {
  return {
    normalize: {
      q: function (obj, urlEncode) {
        function flattenObj(x, path) {
          var result = [];

          path = path || [];
          Object.keys(x).forEach(function (key) {
            if (!x.hasOwnProperty(key)) return;

            var newPath = path.slice();
            newPath.push(key);

            var vals = [];
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

        var parts = flattenObj(obj);

        parts = parts.map(function (varInfo) {
          if (varInfo.path.length == 1) varInfo.path = varInfo.path[0];else {
            var first = varInfo.path[0];
            var rest = varInfo.path.slice(1);
            varInfo.path = first + '[' + rest.join('][') + ']';
          }
          return varInfo;
        });

        var queryString = parts.map(function (varInfo) {
          return varInfo.path + '=' + varInfo.val;
        }).join('&');
        if (urlEncode)
          return encodeURIComponent(queryString);
        else
          return queryString;
      }
    },
    ajax: {
      request: function(ops) {
        if (typeof ops == 'string')
          ops = { url: ops };

        ops.url = ops.url || '';
        ops.method = ops.method || 'get';
        ops.data = ops.data || {};

        var api = {
          /* jshint expr: true */
          host: {},
          process: function(ops) {
            var self = this;
            this.xhr = null;

            if(window.ActiveXObject) {
              this.xhr = new window.ActiveXObject('Microsoft.XMLHTTP');
            } else if(window.XMLHttpRequest) {
              this.xhr = new XMLHttpRequest();
            }

            if(this.xhr) {
              this.xhr.onreadystatechange = function() {
                if(self.xhr.readyState == 4) {
                  var result = self.xhr.responseText || '{}';

                  if(ops.json === true && typeof JSON !== 'undefined') {
                    result = JSON.parse(result);
                  }

                  self.alwaysCallback && self.alwaysCallback.apply(self.host, [result, self.xhr]);
                }
              };
            }

            this.xhr.open('GET', `${ops.url}?${EBANX.http.normalize.q(ops.data)}`, true);

            setTimeout(function() {
              self.xhr.send();
            }, 20);

            return this;
          },
          always: function(callback) {
            this.alwaysCallback = callback;
            return this;
          }
        };
        return api.process(ops);
      }
    },
    injectJS: (src, cb) => {
      const s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.onload = cb;
      s.src = src;
      document.getElementsByTagName('head')[0].appendChild(s);
    }
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
      error: {}
    };

    const tokenSuccess = resp => {
      response.data = resp;

      EBANX.deviceFingerprint.setup(function(deviceId){
        response.data.deviceId = deviceId;

        return createTokenCallback(response);
      });
    };

    const tokenError = err => {
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
      let validatorResponse = JSON.parse(validatorResponseJson);

      if (!validatorResponse.success) {
        response.error.err = {
          status: "ERROR",
          status_code: "",
          status_message: validatorResponse.body.error
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
  ebanx_session_id: null,
  providerSessionList: [],
  providerPostPending: null,

  setup: function (cb) {
    var self = this;
    this.getList(function (list) {
      if (!(list && list.ebanx_session_id))
        return;

      EBANX.deviceFingerprint.ebanx_session_id = list.ebanx_session_id;
      cb(list.ebanx_session_id);
      list.providers.forEach(function (provider) {
        self.getProviderSessionId(provider);
      });
    });
  },

  getList: function (cb) {
    EBANX.http.ajax.request({
      url: EBANX.utils.api.resources.fingerPrintResource().url,
      data: {
          publicIntegrationKey: EBANX.config.getPublishableKey(),
          country: EBANX.config.getCountry()
      },
      json: true
    })
    .always(cb);
  },

  getProviderSessionId: function (provider) {
    this.loadProvider(provider, this.saveProviderSessionList);
  },

  saveProviderSessionList: function (providerSession) {
    var self = EBANX.deviceFingerprint;
    if (self.providerPostPending) {
      clearTimeout(self.providerPostPending);
    }

    self.providerSessionList.push(providerSession);
    self.providerPostPending = setTimeout(self.postProviderSessionList, 1000);
  },

  postProviderSessionList: function () {
    var self = EBANX.deviceFingerprint;
    var providers = self.providerSessionList;
    self.providerSessionList = [];

    clearTimeout(self.providerPostPending);
    self.providerPostPending = null;

    var data = {
      publicIntegrationKey: EBANX.config.getPublishableKey(),
      ebanx_session_id: self.ebanx_session_id,
      providers: providers
    };

    EBANX.http.ajax.request({
      url: EBANX.utils.api.resources.fingerPrintProvidersResource().url,
      data: data,
      method: "post",
      json: true
    });
  },

  loadProvider: function (data, cb) {
    EBANX.http.injectJS(data.source, function () {
      EBANX.deviceFingerprint[data.provider].setup(data.settings, function (session_id) {
        cb({
          provider: data.provider,
          session_id: session_id
        });
      });
    });
  }
};

module.exports = EBANX;
