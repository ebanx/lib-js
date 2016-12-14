/*global describe*/
/*global it*/

var EBANX  = require( '../../../src/ebanx' );
var should = require('should');

describe( 'EBANX', function() {
  describe( '~Unit~', function() {
    describe( 'Config', function() {
      describe( 'publishableKey', function() {
        it( 'getEmptyPublishableKey', function() {
          (function(){
            EBANX.config.getPublishableKey();
          }).should.throw();
        });
        // it( 'can', function() {
        //     EBANX.config.setPublishableKey(1231000);
        //     EBANX.config.getPublishableKey()
        //         .should.equal('1231000');
        //     ;
        // });
        // it( 'invalid', function() {
        //     (function(){
        //         EBANX.config.setPublishableKey(12310001);
        //     }).should.throw();
        //
        //     EBANX.config.getPublishableKey()
        //         .should.not.equal(12310001)
        //     ;
        // });
      });
      describe('mode', function () {
        it('canTest', function () {
          EBANX.config.setMode('test');

          EBANX.config.isLive().should.equal(false);
          EBANX.config.getMode().should.equal('test');
        });
        it('canProduction', function () {
          EBANX.config.setMode('production');

          EBANX.config.isLive().should.equal(true);
          EBANX.config.getMode().should.equal('production');
        });
        it('invalid', function () {
          (function(){
            EBANX.config.setMode('env');
          }).should.throw();
        });
      });
    });
  });
});
