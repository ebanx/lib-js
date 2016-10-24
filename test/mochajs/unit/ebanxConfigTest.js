var
    Ebanx  = require( '../../../src/ebanx' ),
    should = require( 'should' )
;

describe( 'Ebanx', function() {
    describe( '~Unit~', function() {
        describe( 'Config', function() {
            describe( 'publishableKey', function() {
                it( 'getEmptyPublishableKey', function() {
                    (function(){
                        Ebanx.config.getPublishableKey();
                    }).should.throw();
                });
                it( 'can', function() {
                    Ebanx.config.setPublishableKey(1231000);
                    Ebanx.config.getPublishableKey()
                        .should.equal('1231000');
                    ;
                });
                it( 'invalid', function() {
                    (function(){
                        Ebanx.config.setPublishableKey(12310001);
                    }).should.throw();

                    Ebanx.config.getPublishableKey()
                        .should.not.equal(12310001)
                    ;
                });
            });
        });
    });
});
