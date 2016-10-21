var
    Ebanx  = require( '../../../src/ebanx' ),
    should = require( 'should' )
;

describe( 'Ebanx', function() {
    describe( '~Unit~', function() {
        describe( 'Validator', function() {
            describe( 'Card', function() {
                describe( 'cardNumber', function() {
                    it( 'can', function() {
                        Ebanx.validator.card.validateNumber(4111111111111111);
                    });
                    it( 'invalid', function() {
                        (function(){
                            Ebanx.validator.card.validateNumber(4111111111111112);
                        }).should.throw();
                    });
                });
                describe( 'cardCvv', function() {
                    it( 'can', function() {
                        Ebanx.validator.card.validateCvv(123);
                    });
                    it( 'invalid', function() {
                        (function(){
                            Ebanx.validator.card.validateCvv(1234);
                        }).should.throw();
                    });
                });
                describe( 'cardDueDate', function() {
                    it( 'can', function() {
                        Ebanx.validator.card.validateDueDate("12/2222");
                    });
                    it( 'invalid', function() {
                        (function(){
                            Ebanx.validator.card.validateDueDate("09/1999");
                        }).should.throw();
                    });
                    it( 'invalidMonth', function() {
                        (function(){
                            Ebanx.validator.card.validateDueDate("13/2222");
                        }).should.throw();
                    });
                    it( 'invalidYear', function() {
                        (function(){
                            Ebanx.validator.card.validateDueDate("12/222a");
                        }).should.throw();
                    });
                });
            });
        });
    });
});