var
    Ebanx  = require( '../../src/ebanx' ),
    should = require( 'should' )
;

describe( 'Ebanx', function() {
    describe( 'Card', function() {
        before(function() {
            Ebanx.config.setPublishableKey(1231000);

            this.mock = {
                valid: {
                    card: {
                        number: 4111111111111111,
                        name: "Justin Bieber",
                        dueDate: "12/2222",
                        cvv: 123
                    }
                },
                invalid: {
                    card: {
                        cvv: 1234,
                        number: 4111111111111112
                    }
                }
            };
        });

        describe( 'createToken', function() {
            it( 'can', function() {
                var createTokenCallback = function(ebanxResponse) {
                    (ebanxResponse.error)
                        .should.be.an.Object()
                        .and
                        .be.empty()
                    ;

                    (ebanxResponse.token)
                        .should.be.an.Object()
                        .and
                        .be.not.empty()
                        .and
                        .have.property('id')
                        .be.an.String()
                        .and
                        .be.not.empty()
                    ;
                };

                Ebanx.card.createToken({
                    card_number: this.mock.valid.card.number,
                    card_name: this.mock.valid.card.name,
                    card_due_date: this.mock.valid.card.dueDate,
                    card_cvv: this.mock.valid.card.cvv
                }, createTokenCallback);
            });

            it( 'invalidCardNumber', function() {
                var createTokenCallback = function(ebanxResponse) {
                    (ebanxResponse.error)
                        .should.be.an.Object()
                        .and
                        .be.not.empty()
                        .and
                        .have.property('err')
                        .be.an.Object()
                        .and
                        .be.not.empty()
                        .and
                        .have.property('message')
                        .be.equal('Invalid card number.')
                    ;
                };

                Ebanx.card.createToken({
                    card_number: this.mock.invalid.card.number,
                    card_name: this.mock.valid.card.name,
                    card_due_date: this.mock.valid.card.dueDate,
                    card_cvv: this.mock.valid.card.cvv
                }, createTokenCallback);
            });

            it( 'invalidCardCvv', function() {
                var createTokenCallback = function(ebanxResponse) {
                    (ebanxResponse.error)
                        .should.be.an.Object()
                        .and
                        .be.not.empty()
                        .and
                        .have.property('err')
                        .be.an.Object()
                        .and
                        .be.not.empty()
                        .and
                        .have.property('message')
                        .be.equal('Invalid card cvv.')
                    ;
                };

                Ebanx.card.createToken({
                    card_number: this.mock.valid.card.number,
                    card_name: this.mock.valid.card.name,
                    card_due_date: this.mock.valid.card.dueDate,
                    card_cvv: this.mock.invalid.card.cvv
                }, createTokenCallback);
            });
        });
    });
});