QUnit.module( "Ebanx ~> Card ~> CreateToken" );

var mock = {
    config: {
        publishableKey: 'pk_1231000'
    },
    valid: {
        card: {
            numbers: {
              visa: '4111111111111111',
              amex: '378282246310005',
              aura: '5078601870000127985',
              diners: '30569309025904',
              discover: '6011111111111117',
              elo: '6362970000457013',
              hipercard: '6062825624254001',
              mastercard: '5555555555554444'
            },
            name: "Justin Bieber",
            dueDate: "12/2222",
            cvv: 123
        },
        country: 'br',
        createTokenCallback: function (assert, done, ebanxResponse) {
          assert.equal(ebanxResponse.error.constructor, Object);
          assert.equal(Object.keys(ebanxResponse.error).length, 0);

          assert.equal(ebanxResponse.data.constructor, Object);
          assert.ok(Object.keys(ebanxResponse.data).length > 0);
          assert.ok(ebanxResponse.data.hasOwnProperty('token'));
          assert.equal(ebanxResponse.data.token.constructor, String);
          assert.ok(ebanxResponse.data.token.trim() != '');

          done();
        }
    },
    invalid: {
        card: {
            cvv: 1234,
            dueDate: {
                year: "12/222a",
                date: "09/1999",
                month: "13/2222"
            },
            numbers: {
                visa: '411111111111112',
                amex: '378282246310004',
                aura: '5078601870000127986',
                diners: '30569309025907',
                discover: '6011111111111118',
                elo: '6362970000457019',
                hipercard: '6062825624254000',
                mastercard: '5555555555554442'
            }
        },
        country: 'zz',
        createTokenCallback: function (assert, done, ebanxResponse) {
          assert.equal(ebanxResponse.data.constructor, Object);
          assert.equal(Object.keys(ebanxResponse.data).length, 0);

          assert.equal(ebanxResponse.error.constructor, Object);
          assert.ok(Object.keys(ebanxResponse.error).length > 0);
          assert.ok(ebanxResponse.error.hasOwnProperty('err'));
          assert.ok(ebanxResponse.error.err.hasOwnProperty('message'));
          assert.equal(ebanxResponse.error.err.message, 'Invalid card number.');

          done();
        }
    }
};

Ebanx.config.setPublishableKey(mock.config.publishableKey);

QUnit.test( "canVisa", function( assert ) {
    assert.expect(7);

    var done = assert.async(1);

    // Wait for setPublishableKey async
    setTimeout(function () {
      Ebanx.card.createToken({
        card_number: mock.valid.card.numbers.visa,
        card_name: mock.valid.card.name,
        card_due_date: mock.valid.card.dueDate,
        card_cvv: mock.valid.card.cvv,
        country: mock.valid.country
      }, mock.valid.createTokenCallback.bind(null, assert, done));
    }, 2000);
});

QUnit.test( "canAura", function( assert ) {
  assert.expect(7);

  var done = assert.async(1);

  // Wait for setPublishableKey async
  setTimeout(function () {
    Ebanx.card.createToken({
      card_number: mock.valid.card.numbers.aura,
      card_name: mock.valid.card.name,
      card_due_date: mock.valid.card.dueDate,
      card_cvv: mock.valid.card.cvv,
      country: mock.valid.country
    }, mock.valid.createTokenCallback.bind(null, assert, done));
  }, 2000);
});

QUnit.test( "canElo", function( assert ) {
  assert.expect(7);

  var done = assert.async(1);

  // Wait for setPublishableKey async
  setTimeout(function () {
    Ebanx.card.createToken({
      card_number: mock.valid.card.numbers.elo,
      card_name: mock.valid.card.name,
      card_due_date: mock.valid.card.dueDate,
      card_cvv: mock.valid.card.cvv,
      country: mock.valid.country
    }, mock.valid.createTokenCallback.bind(null, assert, done));
  }, 2000);
});

QUnit.test( "invalidCardNumberVisa", function( assert ) {
  assert.expect(7);

  var done = assert.async(1);

  // Wait for setPublishableKey async
  setTimeout(function () {
    Ebanx.card.createToken({
      card_number: mock.invalid.card.numbers.visa,
      card_name: mock.valid.card.name,
      card_due_date: mock.valid.card.dueDate,
      card_cvv: mock.valid.card.cvv,
      country: mock.valid.country
    }, mock.invalid.createTokenCallback.bind(null, assert, done));
  }, 2000);
});

QUnit.test( "invalidCardNumberAmex", function( assert ) {
  assert.expect(7);

  var done = assert.async(1);

  // Wait for setPublishableKey async
  setTimeout(function () {
    Ebanx.card.createToken({
      card_number: mock.invalid.card.numbers.amex,
      card_name: mock.valid.card.name,
      card_due_date: mock.valid.card.dueDate,
      card_cvv: mock.valid.card.cvv,
      country: mock.valid.country
    }, mock.invalid.createTokenCallback.bind(null, assert, done));
  }, 2000);
});

QUnit.test( "invalidCardNumberElo", function( assert ) {
  assert.expect(7);

  var done = assert.async(1);

  // Wait for setPublishableKey async
  setTimeout(function () {
    Ebanx.card.createToken({
      card_number: mock.invalid.card.numbers.elo,
      card_name: mock.valid.card.name,
      card_due_date: mock.valid.card.dueDate,
      card_cvv: mock.valid.card.cvv,
      country: mock.valid.country
    }, mock.invalid.createTokenCallback.bind(null, assert, done));
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
          card_number: mock.valid.card.numbers.visa,
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
          card_number: mock.valid.card.numbers.visa,
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
          card_number: mock.valid.card.numbers.visa,
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
        card_number: mock.valid.card.numbers.visa,
        card_name: mock.valid.card.name,
        card_due_date: mock.valid.card.dueDate,
        card_cvv: mock.valid.card.cvv,
        country: mock.invalid.country
      }, createTokenCallback);
    }, 2000);
});
