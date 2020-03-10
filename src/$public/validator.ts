  const cachedResults = {
    publicKey: {},
  };

  export const validator = {
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
            raw: true,
            data: {
              public_integration_key: key,
            },
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
      },
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
        const regex = /^3[47][0-9]{13}$|^50[0-9]{14,17}$|^(636368|438935|504175|451416|636297|5067|4576|4011|50904|50905|50906|568009|230540|230868)|^3(?:0[0-5]|[68][0-9])[0-9]{11}$|^6(?:011|5[0-9]{2})[0-9]{12}$|^(38|60)[0-9]{11,17}$|^5[1-5][0-9]{14}$|^4[0-9]{12}(?:[0-9]{3})?$/;
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
      luhnAlgCheck: function (cardNumber) {
        /* jshint expr: true */
        let b, c, d, e;
        for (d = +cardNumber[b = cardNumber.length - 1], e = 0; b--;)
          c = +cardNumber[b], d += ++e % 2 ? 2 * c % 10 + (c > 4) : c;
        return (d % 10) === 0;
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
        const regex = new RegExp('^[0-9]{3,4}$');
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
        let date = (dueDate + '').split('/');

        date = {
          now: new Date(),
          year: date[1],
          month: date[0],
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
      },
    },
  };
}
