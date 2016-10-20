/**
 * @module Ebanx
 * @global
 */
const Ebanx = (function () {
    "use strict";

    const $public = {};
    const _private = {};

    $public.config = (function() {
        return {
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
            validateCvv : function (cvv) {
                var regex = new RegExp("^[0-9]{3}$");
                if (!regex.test(cvv))
                    throw new Ebanx.errors.invalidValueField('Invalid card cvv.', 'card_cvv');
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
                this.validateNumber(cardData.card_number);
                this.validateCvv(cardData.card_cvv);
            }
        }
    };
})();

Ebanx.tokenize = (function () {
    return {
        card: {
            token: function (cardData, cb) {
                return cb({token: {id: "1234"}, error: {}});
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

});

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
            error: {},
            token: {}
        };

        try {
            Ebanx.validator.card.validate(cardData);
            Ebanx.tokenize.card.token(cardData, function (resp) {
                if (resp.error.message){
                    // TODO: ? or Exception?
                }

                response.token = resp.token;
            });
        } catch (e) {
            if (e instanceof Ebanx.errors.invalidValueField) {
                // TODO: i18n
            }
            response.error.err = e;
        } finally {
            return createTokenCallback(response);
        }
    };

    return $public;
})();

module.exports = Ebanx;