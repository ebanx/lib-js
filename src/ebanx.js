/**
 * @module Ebanx
 * @global
 */
const Ebanx = (function () {
  const $public = {};
  const _private = {
    mode: 'test',
    publicKey: ''
  };

  $public.config = (function() {
    return {
      isLive: (_private.mode === 'production'),
      setPublishableKey: function (key) {
        Ebanx.validator.config.validatePublishableKey(key, function () {
          _private.publicKey = String(key);
        });
      },
      getPublishableKey: function () {
        if (_private.publicKey.trim() === '')
          throw new Ebanx.errors.InvalidConfigurationError('Missing publishable key. You need set publishable key using the method Ebanx.config.setPublishableKey.', 'publicKey');

        return _private.publicKey;
      }
    };
  })();

  if ($public.config.isLive && location.protocol !== 'https:') {
    throw 'EbanxInvalidConfigurationError: Your protocol needs to be https.';
  }

  return $public;
})();

Ebanx.errors = (function () {
  return {
    InvalidValueFieldError: function (message, field) {
      this.message = message;
      this.field = field;
      this.name = "InvalidValueFieldError";
    },
    InvalidConfigurationError: function (message, config) {
      this.message = message;
      this.invalidConfiguration = config;
      this.name = 'InvalidConfigurationError';
    },
    ResponseError: function (err) {
      this.message = err.message;
    }
  };
})();

/**
 * Protected module validator - utils to validate objects data
 * @module Ebanx/validator
 * @namespace Ebanx/validator
 * @protected
 */
Ebanx.validator = (function () {
  return {
    config: {
      validatePublishableKey: function (key, cb) {
        const publicKeyResource = Ebanx.utils.api.resources.validPublicIntegrationKey;

        Ebanx.http.ajax
          .request({
            url: publicKeyResource.url,
            method: publicKeyResource.method,
            data: {
              public_integration_key: key
            }
          })
          .always(function (res) {
            cb(res);
          });
      }
    },
    /**
     * Card object validator in Ebanx/validator~card.
     *
     * @memberof Ebanx/validator
     * @inner
     */
    card: {
      /**
       *
       * @function validateNumber - validate a card number
       * @param {number} number - Number of card to validate.
       * @throws {Ebanx.errors.InvalidValueFieldError} case card number is not valid
       *
       * @return {void}
       */
      validateNumber: function (number) {
        var regex = /^3[47][0-9]{13}$|^50[0-9]{14,17}$|^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)|^3(?:0[0-5]|[68][0-9])[0-9]{11}$|^6(?:011|5[0-9]{2})[0-9]{12}$|^(38|60)[0-9]{11,17}$|^5[1-5][0-9]{14}$|^4[0-9]{12}(?:[0-9]{3})?$/;
        if (!regex.test(number) || !this.luhnAlgCheck(String(number)))
          throw new Ebanx.errors.InvalidValueFieldError('Invalid card number.', 'card_number');
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
       * @throws {Ebanx.errors.InvalidValueFieldError} case card cvv is not valid
       *
       * @return {void}
       */
      validateCvv: function (cvv) {
        var regex = new RegExp("^[0-9]{3}$");
        if (!regex.test(cvv))
          throw new Ebanx.errors.InvalidValueFieldError('Invalid card cvv.', 'card_cvv');
      },
      /**
       *
       * @function validateDueDate - validate a card due date
       * @param {string} dueDate - Due date of card to validate.
       * @throws {Ebanx.errors.InvalidValueFieldError} case card due date is not valid
       * @throws {Ebanx.errors.InvalidValueFieldError} case card due date year is not valid
       * @throws {Ebanx.errors.InvalidValueFieldError} case card due date month is not valid
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
          throw new Ebanx.errors.InvalidValueFieldError('Invalid month to card due_date.', 'card_due_date');
        }
        if (!(/^\d+$/).test(date.year)) {
          throw new Ebanx.errors.InvalidValueFieldError('Invalid year to card due_date.', 'card_due_date');
        }

        date.expiration = new Date(date.year, date.month);

        date.expiration.setMonth(date.expiration.getMonth() - 1);
        date.expiration.setMonth(date.expiration.getMonth() + 1, 1);

        if ((date.expiration > date.now) !== true) {
          throw new Ebanx.errors.InvalidValueFieldError('Invalid card due_date.', 'card_due_date');
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
       * @param {string} cardData.country       - Customer country
       *
       * @return {void}
       */
      validate: function (cardData) {
        this.validateCvv(cardData.card_cvv);
        this.validateNumber(cardData.card_number);
        this.validateDueDate(cardData.card_due_date);
        Ebanx.validator.customer.validateCountry(cardData.country);
      }
    },
    customer: {
      /**
       *
       * @function validateCountry - validate the customer country
       * @param {string} country - Customer country to validate
       * @throws {Ebanx.errors.InvalidValueFieldError} case country is not valid
       *
       * @return {void}
       */
      validateCountry: function (country) {
        if (Ebanx.utils.availableCountries.indexOf(country) === -1)
          throw new Ebanx.errors.InvalidValueFieldError(`Invalid customer country. You can use one of them: ${Ebanx.utils.availableCountries}.`, 'country');
      }
    }
  };
})();

Ebanx.tokenize = (function () {
  return {
    card: {
      token: function (cardData, cb) {
        const tokenResource = Ebanx.utils.api.resources.createToken;

        Ebanx.http.ajax.request({
          url: tokenResource.url,
          method: tokenResource.method,
          json: true,
          data: {
            request_body: JSON.stringify({
              public_integration_key: Ebanx.config.getPublishableKey(),
              payment_type_code: Ebanx.utils.creditCardScheme(cardData.card_number),
              country: cardData.country,
              card: cardData
            })
          }
        })
          .always(function(result) {
            if (result.status === 'ERROR' || !('token' in result)) {
              throw new Ebanx.errors.ResponseError(result.status_message || 'Error to tokenize.');
            }

            cb(result);
          });
      }
    }
  };
})();

/**
 * Public Utils Module
 * @module Ebanx/utils
 * @public
 */
Ebanx.utils = (function () {
  const utilsModule = {
    api: {
      url: (Ebanx.config.isLive ? 'http://dev-pay.ebanx.com/ws' : 'http://dev-pay.ebanx.com/ws')
    },
    availableCountries: ['br', 'cl', 'co', 'mx', 'pe'].join(', '),
    creditCardScheme: function (cardNumber) {
      Ebanx.validator.card.validateNumber(cardNumber);

      let schemes = {
        amex: /^3[47][0-9]{13}$/,
        aura: /^50[0-9]{14,17}$/,
        elo: /^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906)/,
        diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
        discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
        hipercard: /^(38|60)[0-9]{11,17}$/,
        mastercard: /^5[1-5][0-9]{14}$/,
        visa: /^4[0-9]{12}(?:[0-9]{3})?$/
      };

      for (let scheme in schemes) {
        if (schemes[scheme].test(cardNumber)) {
          return scheme;
        }
      }

      throw new Ebanx.errors.InvalidValueFieldError('Credit card scheme not found.', 'card_number');
    }
  };

  utilsModule.api.resources = {
    createToken: {
      url: `${utilsModule.api.url}/token`,
      method: 'get'
    },
    validPublicIntegrationKey: {
      url: `${utilsModule.api.url}/merchantIntegrationProperties/isValidPublicIntegrationKey`,
      method: 'get'
    }
  };

  return utilsModule;
})();


Ebanx.http = (function () {
  return {
    normalize: {
      q: function(data, url) {
        var arr = [], str;
        for(var name in data) {
          arr.push(name + '=' + encodeURIComponent(data[name]));
        }
        str = arr.join('&');
        if(str !== '') {
          return url ? (url.indexOf('?') < 0 ? '?' + str : '&' + str) : str;
        }
        return '';
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
              this.xhr = new ActiveXObject('Microsoft.XMLHTTP');
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

            if(ops.method.toLowerCase() === 'get') {
              this.xhr.open("GET", `${ops.url}${Ebanx.http.normalize.q(ops.data, ops.url)}`, true);
            } else {
              this.xhr.open(ops.method.toUpperCase(), ops.url, true);
            }

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
    }
  };
})();

/**
 * Public module Card payment method of EBANX
 * @module Ebanx/card
 * @public
 */
Ebanx.card = (function () {
  const $public = {};

  /**
   *
   * @param {number} cardData.card_number     - Number of card.
   * @param {string} cardData.card_name       - Name of card.
   * @param {string} cardData.card_due_date   - Due date of card (format: MM/YYYY).
   * @param {number} cardData.card_cvv        - Cvv of card.
   * @param {string} cardData.country         - Customer country
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
         card_cvv: 123,
         country: 'br'
        };
   Ebanx.card.createToken(cardData, createTokenCallback);
   *
   * @return {object} response object.
   * @type {{createToken}}
   */
  $public.createToken = function (cardData, createTokenCallback) {
   const response = {
      data: {},
      error: {}
    };

    try {
      Ebanx.validator.card.validate(cardData);
      Ebanx.tokenize.card.token(cardData, function (resp) {
        response.data = resp;
        createTokenCallback(response);
      });
    } catch (e) {
      if (e instanceof Ebanx.errors.InvalidValueFieldError) {
        // TODO: i18n
      }
      response.error.err = e;

      createTokenCallback(response);
    }
  };

  return $public;
})();

module.exports = Ebanx;
