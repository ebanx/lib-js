/**
 * @module Ebanx
 * @global
 */
const Ebanx = (function () {
    "use strict";

    const $public = {};
    const _private = {
        mode: 'test'
    };

    $public.config = (function() {
        return {
            isLive: (_private.mode === 'production'),
            setPublishableKey: function (key) {
                Ebanx.validator.config.validatePublishableKey(key);
                _private.publicKey = key;
            },
            getPublishableKey: function () {
                // TODO: valid if not empty
                return _private.publicKey;
            }
        };
    })();

    return $public;
})();

Ebanx.errors = (function () {
    return {
        invalidValueField: function (message, field) {
            this.message = message;
            this.field = field;
            this.name = "invalidValueField";
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
            validatePublishableKey: function (key) {
                // @TODO how make this?
                var regex = new RegExp("^[0-9]{7}$");
                if (!regex.test(key))
                    throw new Ebanx.errors.invalidValueField('Invalid PublishableKey.', 'PublishableKey');
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
             * @throws {Ebanx.errors.invalidValueField} case card number is not valid
             *
             * @return {void}
             */
            validateNumber: function (number) {
                var regex = new RegExp("^[0-9]{16}$");
                if (!regex.test(number) || !this.luhnAlgCheck(number))
                    throw new Ebanx.errors.invalidValueField('Invalid card number.', 'card_number');
            },
            /**
             *
             * @function luhnAlgCheck - luhn algorithm
             * @see https://en.wikipedia.org/wiki/Luhn_algorithm
             * @param {string} val - Number of card to apply alg.
             *
             * @return {boolean} true if valid false if not valid
             */
            luhnAlgCheck: function (val) {
                val = (val + '').replace(/\s+|-/g, '');
                var sum = 0;
                for (var i = 0; i < val.length; i++) {
                    var intVal = parseInt(val.substr(i, 1));
                    if (i % 2 === 0) {
                        intVal *= 2;
                        if (intVal > 9) {
                            intVal = 1 + (intVal % 10);
                        }
                    }
                    sum += intVal;
                }
                return (sum % 10) === 0;
            },
            /**
             *
             * @function validateCvv - validate a card cvv
             * @param {number} cvv - Cvv of card to validate.
             * @throws {Ebanx.errors.invalidValueField} case card cvv is not valid
             *
             * @return {void}
             */
            validateCvv: function (cvv) {
                var regex = new RegExp("^[0-9]{3}$");
                if (!regex.test(cvv))
                    throw new Ebanx.errors.invalidValueField('Invalid card cvv.', 'card_cvv');
            },
            /**
             *
             * @function validateDueDate - validate a card due date
             * @param {string} dueDate - Due date of card to validate.
             * @throws {Ebanx.errors.invalidValueField} case card due date is not valid
             * @throws {Ebanx.errors.invalidValueField} case card due date year is not valid
             * @throws {Ebanx.errors.invalidValueField} case card due date month is not valid
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
                    throw new Ebanx.errors.invalidValueField('Invalid month to card due_date.', 'card_due_date');
                }
                if (!(/^\d+$/).test(date.year)) {
                    throw new Ebanx.errors.invalidValueField('Invalid year to card due_date.', 'card_due_date');
                }

                date.expiration = new Date(date.year, date.month);

                date.expiration.setMonth(date.expiration.getMonth() - 1);
                date.expiration.setMonth(date.expiration.getMonth() + 1, 1);

                if ((date.expiration > date.now) !== true) {
                    throw new Ebanx.errors.invalidValueField('Invalid card due_date.', 'card_due_date');
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
                this.validateCvv(cardData.card_cvv);
                this.validateNumber(cardData.card_number);
                this.validateDueDate(cardData.card_due_date);
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
                    data: cardData
                })
                .done(function(result) {
                    cb(result.body);
                })
                .fail(function(xhr) {
                    // TODO: throw
                    console.log("failllllllllllll", xhr);
                    response.error = xhr;
                });
            }
        },
        boleto: {}
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
            url: (Ebanx.config.isLive ? 'http://dev-pay.ebanx.com/ws/merchantSettlement/' : 'http://dev-pay.ebanx.com/ws/merchantSettlement/')
        }
    };

    utilsModule.api.resources = {
        createToken: {
            url: utilsModule.api.url + 'getExtract',
                method: 'post'
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
                                if(self.xhr.readyState == 4 && self.xhr.status == 200) {
                                    var result = self.xhr.responseText;
                                    if(ops.json === true && typeof JSON != 'undefined') {
                                        result = JSON.parse(result);
                                    }
                                    self.doneCallback && self.doneCallback.apply(self.host, [result, self.xhr]);
                                } else if(self.xhr.readyState == 4) {
                                    self.failCallback && self.failCallback.apply(self.host, [self.xhr]);
                                }
                                self.alwaysCallback && self.alwaysCallback.apply(self.host, [self.xhr]);
                            };
                        }

                        if(ops.method == 'get') {
                            this.xhr.open("GET", ops.url + Ebanx.http.normalize.q(ops.data, ops.url), true);
                        } else {
                            this.xhr.open(ops.method, ops.url, true);
                            this.setHeaders({
                                'X-Requested-With': 'XMLHttpRequest',
                                'Content-type': 'application/x-www-form-urlencoded'
                            });
                        }

                        if(ops.headers && typeof ops.headers == 'object') {
                            this.setHeaders(ops.headers);
                        }

                        setTimeout(function() {
                            ops.method == 'get' ? self.xhr.send() : self.xhr.send(Ebanx.http.ajax.request(ops.data));
                        }, 20);

                        return this;
                    },
                    done: function(callback) {
                        this.doneCallback = callback;
                        return this;
                    },
                    fail: function(callback) {
                        this.failCallback = callback;
                        return this;
                    },
                    always: function(callback) {
                        this.alwaysCallback = callback;
                        return this;
                    },
                    setHeaders: function(headers) {
                        for(var name in headers) {
                            this.xhr && this.xhr.setRequestHeader(name, headers[name]);
                        }
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
        // TODO: Create?
        // if (Ebanx.utils.isElement?)
        // provider.construct() ?;

        const response = {
            token: {},
            error: {}
        };

        try {
            Ebanx.validator.card.validate(cardData);
            Ebanx.tokenize.card.token(cardData, function (resp) {
                response.token = resp;
                createTokenCallback(response);
            });
        } catch (e) {
            if (e instanceof Ebanx.errors.invalidValueField) {
                // TODO: i18n
            }
            response.error.err = e;
        }
        // finally {
        //     return createTokenCallback(response);
        // }
    };

    return $public;
})();

module.exports = Ebanx;