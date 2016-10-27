QUnit.module( "Ebanx ~> Card ~> CreateToken" );

var mock = {
    config: {
        publishableKey: 1231000
    },
    valid: {
        card: {
            number: 4111111111111111,
            name: "Justin Bieber",
            dueDate: "12/2222",
            cvv: 123
        },
        country: 'br'
    },
    invalid: {
        card: {
            cvv: 1234,
            dueDate: {
                year: "12/222a",
                date: "09/1999",
                month: "13/2222"
            },
            number: 4111111111111112
        },
        country: 'zz'
    }
};

Ebanx.config.setPublishableKey(mock.config.publishableKey);

QUnit.test( "can", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
      assert.equal(ebanxResponse.error.constructor, Object);
      assert.equal(Object.keys(ebanxResponse.error).length, 0);

      assert.equal(ebanxResponse.data.constructor, Object);
      assert.ok(Object.keys(ebanxResponse.data).length > 0);
      assert.ok(ebanxResponse.data.hasOwnProperty('token'));
      assert.equal(ebanxResponse.data.token.constructor, String);
      assert.ok(ebanxResponse.data.token.trim() != '');

      done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
        card_number: mock.valid.card.number,
        card_name: mock.valid.card.name,
        card_due_date: mock.valid.card.dueDate,
        card_cvv: mock.valid.card.cvv,
        country: mock.valid.country
      }, createTokenCallback);
    }, 2000);

});


QUnit.test( "invalidCardNumber", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
        assert.equal(ebanxResponse.data.constructor, Object);
        assert.equal(Object.keys(ebanxResponse.data).length, 0);

        assert.equal(ebanxResponse.error.constructor, Object);
        assert.ok(Object.keys(ebanxResponse.error).length > 0);
        assert.ok(ebanxResponse.error.hasOwnProperty('err'));
        assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
        assert.equal(ebanxResponse.error.err.message, 'Invalid card number.');

        done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
          card_number: mock.invalid.card.number,
          card_name: mock.valid.card.name,
          card_due_date: mock.valid.card.dueDate,
          card_cvv: mock.valid.card.cvv,
          country: mock.valid.country
      }, createTokenCallback);
    }, 2000);
});

QUnit.test( "invalidCardCvv", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
        assert.equal(ebanxResponse.error.constructor, Object);
        assert.equal(Object.keys(ebanxResponse.data).length, 0);

        assert.equal(ebanxResponse.error.constructor, Object);
        assert.ok(Object.keys(ebanxResponse.error).length > 0);
        assert.ok(ebanxResponse.error.hasOwnProperty('err'));
        assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
        assert.equal(ebanxResponse.error.err.message, 'Invalid card cvv.');

        done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
          card_number: mock.valid.card.number,
          card_name: mock.valid.card.name,
          card_due_date: mock.valid.card.dueDate,
          card_cvv: mock.invalid.card.cvv,
          country: mock.valid.country
      }, createTokenCallback);
    }, 2000);
});

QUnit.test( "invalidCardDueDateMonth", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
        assert.equal(ebanxResponse.error.constructor, Object);
        assert.equal(Object.keys(ebanxResponse.data).length, 0);

        assert.equal(ebanxResponse.error.constructor, Object);
        assert.ok(Object.keys(ebanxResponse.error).length > 0);
        assert.ok(ebanxResponse.error.hasOwnProperty('err'));
        assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
        assert.equal(ebanxResponse.error.err.message, 'Invalid month to card due_date.');

        done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
          card_number: mock.valid.card.number,
          card_name: mock.valid.card.name,
          card_due_date: mock.invalid.card.dueDate.month,
          card_cvv: mock.valid.card.cvv,
          country: mock.valid.country
      }, createTokenCallback);
    }, 2000);
});

QUnit.test( "invalidCardDueDateYear", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
        assert.equal(ebanxResponse.error.constructor, Object);
        assert.equal(Object.keys(ebanxResponse.data).length, 0);

        assert.equal(ebanxResponse.error.constructor, Object);
        assert.ok(Object.keys(ebanxResponse.error).length > 0);
        assert.ok(ebanxResponse.error.hasOwnProperty('err'));
        assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
        assert.equal(ebanxResponse.error.err.message, 'Invalid year to card due_date.');

        done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
          card_number: mock.valid.card.number,
          card_name: mock.valid.card.name,
          card_due_date: mock.invalid.card.dueDate.year,
          card_cvv: mock.valid.card.cvv,
          country: mock.valid.country
      }, createTokenCallback);
    }, 2000);
});

QUnit.test( "invalidCardDueDate", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
        assert.equal(ebanxResponse.error.constructor, Object);
        assert.equal(Object.keys(ebanxResponse.data).length, 0);

        assert.equal(ebanxResponse.error.constructor, Object);
        assert.ok(Object.keys(ebanxResponse.error).length > 0);
        assert.ok(ebanxResponse.error.hasOwnProperty('err'));
        assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
        assert.equal(ebanxResponse.error.err.message, 'Invalid card due_date.');

        done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
          card_number: mock.valid.card.number,
          card_name: mock.valid.card.name,
          card_due_date: mock.invalid.card.dueDate.date,
          card_cvv: mock.valid.card.cvv,
          country: mock.valid.country
      }, createTokenCallback);
    }, 2000);
});

QUnit.test( "invalidCountry", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    var createTokenCallback = function (ebanxResponse) {
      assert.equal(ebanxResponse.error.constructor, Object);
      assert.equal(Object.keys(ebanxResponse.data).length, 0);

      assert.equal(ebanxResponse.error.constructor, Object);
      assert.ok(Object.keys(ebanxResponse.error).length > 0);
      assert.ok(ebanxResponse.error.hasOwnProperty('err'));
      assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
      assert.equal(ebanxResponse.error.err.message, 'Invalid customer country. You can use one of them: br, cl, co, mx, pe.');

      done();
    };

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
        card_number: mock.valid.card.number,
        card_name: mock.valid.card.name,
        card_due_date: mock.valid.card.dueDate,
        card_cvv: mock.valid.card.cvv,
        country: mock.invalid.country
      }, createTokenCallback);
    }, 2000);
});
