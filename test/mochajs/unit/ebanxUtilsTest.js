var
  EBANX  = require( '../../../src/ebanx' ),
  should = require( 'should' )
  ;

describe( 'EBANX', function() {
  describe('~Unit~', function () {
    describe('Utils', function () {
      describe('creditCardScheme', function () {
        it('can', function () {
          var cards = {
            visa: '4111111111111111',
            amex: '378282246310005',
            aura: '5078601870000127985',
            diners: '30569309025904',
            discover: '6011111111111117',
            elo: '6362970000457013',
            hipercard: '6062825624254001',
            mastercard: '5555555555554444'
          };

          EBANX.utils.creditCardScheme(cards.visa).should.equal('visa');
          EBANX.utils.creditCardScheme(cards.amex).should.equal('amex');
          EBANX.utils.creditCardScheme(cards.aura).should.equal('aura');
          EBANX.utils.creditCardScheme(cards.diners).should.equal('diners');
          EBANX.utils.creditCardScheme(cards.discover).should.equal('discover');
          EBANX.utils.creditCardScheme(cards.elo).should.equal('elo');
          EBANX.utils.creditCardScheme(cards.hipercard).should.equal('hipercard');
          EBANX.utils.creditCardScheme(cards.mastercard).should.equal('mastercard');
        });

        it('invalid', function () {
          var cards = {
            visa: '411111111111112',
            amex: '378282246310004',
            aura: '5078601870000127986',
            diners: '30569309025907',
            discover: '6011111111111118',
            elo: '6362970000457019',
            hipercard: '6062825624254000',
            mastercard: '5555555555554442'
          };

          (function () { EBANX.utils.creditCardScheme(cards.visa) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.amex) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.aura) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.diners) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.discover) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.elo) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.hipercard) }).should.throw();
          (function () { EBANX.utils.creditCardScheme(cards.mastercard) }).should.throw();
        });
      });
    });
  });
});
