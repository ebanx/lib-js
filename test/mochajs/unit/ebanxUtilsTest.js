var
  Ebanx  = require( '../../../src/ebanx' ),
  should = require( 'should' )
  ;

describe( 'Ebanx', function() {
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

          Ebanx.utils.creditCardScheme(cards.visa).should.equal('visa');
          Ebanx.utils.creditCardScheme(cards.amex).should.equal('amex');
          Ebanx.utils.creditCardScheme(cards.aura).should.equal('aura');
          Ebanx.utils.creditCardScheme(cards.diners).should.equal('diners');
          Ebanx.utils.creditCardScheme(cards.discover).should.equal('discover');
          Ebanx.utils.creditCardScheme(cards.elo).should.equal('elo');
          Ebanx.utils.creditCardScheme(cards.hipercard).should.equal('hipercard');
          Ebanx.utils.creditCardScheme(cards.mastercard).should.equal('mastercard');
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

          (function () { Ebanx.utils.creditCardScheme(cards.visa) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.amex) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.aura) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.diners) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.discover) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.elo) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.hipercard) }).should.throw();
          (function () { Ebanx.utils.creditCardScheme(cards.mastercard) }).should.throw();
        });
      });
    });
  });
});
