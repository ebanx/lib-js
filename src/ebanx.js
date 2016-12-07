/**
 * @module Ebanx
 * @global
 */
const Ebanx = (function () {
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
        Ebanx.validator.config.validatePublishableKey(key, function (res) {
          // TODO: Implement a validation to check if the key is really valid
          _private.publicKey = String(key);
        });
      },
      setCountry: function (country) {
        Ebanx.validator.config.validateCountry(country);

        _private.country = String(country);
      },
      setMode: function (mode) {
        Ebanx.validator.config.validateMode(mode);

        _private.mode = mode;
      },
      getMode: function () {
        return _private.mode;
      },
      getPublishableKey: function () {
        if (_private.publicKey.trim() === '')
          throw new Ebanx.errors.InvalidConfigurationError('Missing publishable key. You need set publishable key using the method Ebanx.config.setPublishableKey.', 'publicKey');

        return _private.publicKey;
      },
      getCountry: function () {
        if (_private.country.trim() === '')
          throw new Ebanx.errors.InvalidConfigurationError('Missing country.', 'country');

        return _private.country;
      }
    };
  })();

  if ($public.config.isLive() && location.protocol !== 'https:') {
    throw 'EbanxInvalidConfigurationError: Your protocol needs to be https.';
  }

  return $public;
})();

Ebanx.errors = (function () {
  return {
    InvalidValueFieldError: function (message, field) {
      this.message = message;
      this.field = field;
      this.name = 'InvalidValueFieldError';
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
    /**
     * @memberof Ebanx/validator
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
      },
      /**
       *
       * @function validateCountry - validate the transaction country
       * @param {string} country - transaction country to validate
       * @throws {Ebanx.errors.InvalidValueFieldError} case country is not valid
       *
       * @return {void}
       */
      validateCountry: function (country) {
        if (Ebanx.utils.availableCountries.indexOf(country) === -1)
          throw new Ebanx.errors.InvalidValueFieldError(`Invalid transaction country. You can use one of them: ${Ebanx.utils.availableCountries}.`, 'country');
      },
      /**
       * Validate if mode is "test" or "production"
       * @param  {string} mode The mode
       * @throws {Ebanx.errors.InvalidConfigurationError} case the test mode is invalid
       * @return {void}
       */
      validateMode: function (mode) {
        if (mode.match(/^(test|production)$/) === null) {
          throw new Ebanx.errors.InvalidConfigurationError('Invalid mode, please, use "test" or "production" as test mode.', 'mode');
        }
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
       * @function validateName - validate the credit card name
       * @param  {string} name Name of the credit card
       * @throws {Ebanx.errors.InvalidValueFieldError} case name isn't string and doesn't have length
       *
       * @return {void}
       */
      validateName: function (name) {
        if (typeof name !== 'string' || name.length === 0 || name.match(/[0-9]+/) !== null) {
          throw new Ebanx.errors.InvalidValueFieldError('The credit card name is required.');
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
       * @throws {Ebanx.errors.InvalidValueFieldError} case card cvv is not valid
       *
       * @return {void}
       */
      validateCvv: function (cvv) {
        var regex = new RegExp('^[0-9]{3,4}$');
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
          throw new Ebanx.errors.InvalidValueFieldError('Invalid month to card due date.', 'card_due_date');
        }
        if (!(/^\d+$/).test(date.year)) {
          throw new Ebanx.errors.InvalidValueFieldError('Invalid year to card due date.', 'card_due_date');
        }

        date.expiration = new Date(date.year, date.month);

        date.expiration.setMonth(date.expiration.getMonth() - 1);
        date.expiration.setMonth(date.expiration.getMonth() + 1, 1);

        if ((date.expiration > date.now) !== true) {
          throw new Ebanx.errors.InvalidValueFieldError('Invalid card due date.', 'card_due_date');
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
              country: Ebanx.config.getCountry(),
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
      path: (Ebanx.config.isLive() ? 'https://api.ebanx.com/' : 'https://sandbox.ebanx.com/')
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

  utilsModule.api.url = utilsModule.api.path + 'ws';

  utilsModule.api.resources = {
    createToken: {
      url: `${utilsModule.api.url}/token`,
      method: 'get'
    },
    validPublicIntegrationKey: {
      url: `${utilsModule.api.url}/merchantIntegrationProperties/isValidPublicIntegrationKey`,
      method: 'get'
    },
    fingerPrintResource: {
      url: `${utilsModule.api.path}fingerprint/`,
      method: 'get'
    },
    fingerPrintProvidersResource: {
      url: `${utilsModule.api.path}fingerprint/provider`,
      method: 'post'
    }
  };

  return utilsModule;
})();


Ebanx.http = (function () {
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

            this.xhr.open('GET', `${ops.url}?${Ebanx.http.normalize.q(ops.data)}`, true);

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
        Ebanx.deviceFingerprint.setup(function(deviceId){
          response.data.deviceId = deviceId;
          createTokenCallback(response);
        });
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

Ebanx.deviceFingerprint = (function () {
  const $public = {};
  const _private = {
    ebanx_session_id: null,
    providerSessionList: [],
    providerPostPending: null
  };

  _private.providers = {
    kount: {
      setup: function (settings, cb) {
        this.build(settings);
        cb(_private.ebanx_session_id);
      },
      build: function (settings) {
        let d = document;
        let iframe = d.createElement('iframe');
        iframe.width = 1;
        iframe.height = 1;
        iframe.frameborder = 0;
        iframe.scrolling = "no";
        iframe.src = `${Ebanx.utils.api.path}fingerprint/kount?m=${settings.merchant_id}&s=${_private.ebanx_session_id}`;
        iframe.style.border = 0;
        iframe.style.position = "absolute";
        iframe.style.top = "-200px";
        iframe.style.left = "-200px";
        d.getElementsByTagName('body')[0].appendChild(iframe);
      }
    },
    mercadopago: {
      setup: function (settings, cb) {
        cb(this._mpGetDeviceID());
      },
      _mpGuid: function() {
        function a() {
          return Math.floor(65536 * (1 + Math.random())).toString(16).substring(1);
        }
        return a() + a() + "-" + a() + "-" + a() + "-" + a() + "-" + a() + a() + a();
      },
      _mpGetDeviceID: function() {
        var a = this._mpGuid();
        var c = function(a, b, c) {
          var d, e, f, g, h = b || {}, i = c || {};
          h.type = "application/x-shockwave-flash";
          if (window.ActiveXObject) {
            h.classid = "clsid:d27cdb6e-ae6d-11cf-96b8-444553540000";
            i.movie = a;
          } else h.data = a;
          e = "<object";
          for (d in h) e += " " + d + '="' + h[d] + '"';
          e += ">";
          for (d in i) e += '<param name="' + d + '" value="' + i[d] + '" />';
          e += '</object>';
          f = document.createElement("div");
          f.innerHTML = e;
          g = f.firstChild;
          f.removeChild(g);
          return g;
        };
        new Image().src = "https://content.mercadopago.com/fp/clear.png?org_id=jk96mpy0&session_id=" + a + "&m=1";
        new Image().src = "https://content.mercadopago.com/fp/clear.png?org_id=jk96mpy0&session_id=" + a + "&m=2";
        var d = document.createElement("script");
        d.type = "text/javascript";
        d.src = "https://content.mercadopago.com/fp/check.js?org_id=jk96mpy0&session_id=" + a;
        document.body.appendChild(d);
        var e = c("https://content.mercadopago.com/fp/fp.swf?org_id=jk96mpy0&session_id=" + a, {
          id: "obj_id",
          width: 1,
          height: 1
        }, {
          movie: "https://content.mercadopago.com/fp/fp.swf?org_id=jk96mpy0&session_id=" + a
        });
        document.body.appendChild(e);
        return a;
      }
    },
    openpay: {
      cdnUrl: 'https://openpay.s3.amazonaws.com/',
      setup: function (settings, cb) {
        this.loadJs(() => {
          OpenPay.setId(settings.id);
          OpenPay.setApiKey(settings.apiKey);
          OpenPay.setSandboxMode(settings.sandboxMode);

          cb(OpenPay.deviceData.setup());
        });
      },
      loadJs: function (cb) {
        Ebanx.http.injectJS('https://code.jquery.com/jquery-2.2.0.min.js', () => {
          Ebanx.http.injectJS(`${this.cdnUrl}openpay.v1.min.js`, () => {
            Ebanx.http.injectJS(`${this.cdnUrl}openpay-data.v1.min.js`, cb);
          });
        });
      }
    }
  };

  _private.getList = function (cb) {
    const fingerPrintResource = Ebanx.utils.api.resources.fingerPrintResource;

    Ebanx.http.ajax
      .request({
        json: true,
        url: fingerPrintResource.url,
        method: fingerPrintResource.method,
        data: {
          country: Ebanx.config.getCountry(),
          publicIntegrationKey: Ebanx.config.getPublishableKey()
        }
      })
      .always(function (res) {
        cb(res);
      });
  };

  _private.saveProviderSessionList = function (providerSession) {
    if (_private.providerPostPending) {
      clearTimeout(_private.providerPostPending);
    }

    _private.providerSessionList.push(providerSession);
    _private.providerPostPending = setTimeout(_private.postProviderSessionList, 1000);
  };

  _private.postProviderSessionList = function () {
    let providers = _private.providerSessionList;
    _private.providerSessionList = [];

    clearTimeout(_private.providerPostPending);
    _private.providerPostPending = null;

    const fingerPrintProvidersResource = Ebanx.utils.api.resources.fingerPrintProvidersResource;

    Ebanx.http.ajax
      .request({
        url: fingerPrintProvidersResource.url,
        method: fingerPrintProvidersResource.method,
        data: {
          publicIntegrationKey: Ebanx.config.getPublishableKey(),
          ebanx_session_id: _private.ebanx_session_id,
          providers: providers
        }
      })
      .always(function (res) {
        return;
      });
  };

  $public.setup = function (cb) {
    _private.getList(function (list) {
      if (!(list && list.ebanx_session_id)) return; // TODO: how do in this case?

      _private.ebanx_session_id = list.ebanx_session_id;

      cb(list.ebanx_session_id);

      list.providers.forEach(function (data) {
        _private.providers[data.provider].setup(data.settings, function (session_id) {
          _private.saveProviderSessionList({
            provider: data.provider,
            session_id: session_id
          });
        });
      });
    });
  };

  return $public;
})();

module.exports = Ebanx;
