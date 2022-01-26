import EBANX from './ebanx';

class FakeXhr {

 constructor() {
   this.mockResponses = [];
   this.fakeRequests = [];
   this.alwaysCallback = console.log;
 }

 request(fakeRequest) {
   const response = this.mockResponses.shift() || [{}, {}];
   this.fakeRequests.unshift(fakeRequest);
   setTimeout(() => {this.alwaysCallback && this.alwaysCallback(response[0], response[1]);}, 20);

   return this;
 }

 always(cb) {
   this.alwaysCallback = cb;

   return this;
 }

 addFakeResponse(data, xhr) {
   this.mockResponses.push([data, xhr]);

   return this;
 }
}

EBANX.deviceFingerprint['fakeprovider'] = (function () {
 return {
   setup: function (settings, cb) {
     cb('fakeproviderid');
   },
 };
})();


beforeEach(() => {
 EBANX.http.ajax = new FakeXhr();
});

describe('Test Mechanism Check', () => {
 it('should intercept HTTP requests', (done) => {
   EBANX.http.ajax.addFakeResponse({testData: true}, {status: 200, testXhr: true});

   EBANX.http.ajax.request('https://this.url.does.not.exist').always((data, xhr) => {
     expect([data, xhr])
       .toStrictEqual([{testData: true}, {status: 200, testXhr: true}]);
     done();
   });
 });
});


describe('Device Fingerprint', () => {
 beforeEach(() => {
   EBANX.config.setPublishableKey('testkey');
   EBANX.config.setCountry('br');
 });

 it('should send http request to pay on fingerprint failure', (done) => {
   EBANX.http.ajax.addFakeResponse({error: 'Unauthorized'}, {status: 401});
   EBANX.http.ajax.addFakeResponse({}, {status: 200});

   EBANX.deviceFingerprint.setup((id) => { fail('onSuccess called');}, (error) => {
     const fingerprintErrorRequest = EBANX.http.ajax.fakeRequests.find(request => request.url.includes('fingerprint/error'));
     expect(fingerprintErrorRequest).toBeDefined();
     expect(fingerprintErrorRequest.data.errorMessage).toStrictEqual(error.message);
     expect(fingerprintErrorRequest.data.errorMessage).toStrictEqual('EBANX.deviceFingerprint.setup - ebanx_session_id is missing');
     done();
   })
 });

 it('should call onSuccess when succesfully registered', () => {
   EBANX.http.ajax.addFakeResponse({ebanx_session_id: 'fakesession', providers: []}, {status: 200});

   EBANX.deviceFingerprint.setup((id) => { expect(id).toBe('fakession');}, () => { fail('onError called');});
 });

 it('should call onError when registering failed', () => {
   EBANX.http.ajax.addFakeResponse({error: 'Unauthorized'}, {status: 401});

   EBANX.deviceFingerprint.setup((id) => { fail('onSuccess called');}, (error) => { expect(error).toBe('EBANX.deviceFingerprint.setup - ebanx_session_id is missing');});
 });

 it('should call onError when provider id register failed and onError provided', () => {
   EBANX.http.ajax.addFakeResponse({ebanx_session_id: 'fakesession', providers: [{provider: 'fakeprovider', settings: {}, source: 'https://fake.source.jscdn/doesnotexist.js'}]}, {status: 200});
   EBANX.http.ajax.addFakeResponse({}, {status: 429});

   EBANX.deviceFingerprint.setup((id) => { fail('onSuccess called');}, (error) => { expect(error).toBe('postProviderSessionList - xhr.status != 200, received value: 429');});
 });

 it('should not call onError when provider id register failed and onError NOT provided', () => {
   EBANX.http.ajax.addFakeResponse({ebanx_session_id: 'fakesession', providers: [{provider: 'fakeprovider', settings: {}, source: 'https://fake.source.jscdn/doesnotexist.js'}]}, {status: 200});
   EBANX.http.ajax.addFakeResponse({}, {status: 429});

   EBANX.deviceFingerprint.setup((id) => { expect(id).toBe('fakesession'); });
 });


 it('should not call onError when provider id register succeeded', () => {
   EBANX.http.ajax.addFakeResponse({ebanx_session_id: 'fakesession', providers: [{provider: 'fakeprovider', settings: {}, source: 'https://fake.source.jscdn/doesnotexist.js'}]}, {status: 200});
   EBANX.http.ajax.addFakeResponse({}, {status: 200});

   EBANX.deviceFingerprint.setup((id) => { expect(id).toBe('fakesession'); }, (error) => { fail('onError called');});
 });
});

describe('Utils', () => {
  describe('creditCardScheme', () => {
    it.each([
      ['diners',     '30569309025904'],
      ['amex',       '378282749798722'],
      ['visa',       '4111111111111111'],
      ['visa',       '4111115666052208'],
      ['mastercard', '5555556355564617'],
      ['mastercard', '2306505278551556'],
      ['elo',        '6362970000457013'],
      ['elo',        '6362971747129170'],
      ['hipercard',  '6062825624254001'],
      ['discover',   '6011111111111117'],
      ['aura',       '5078601870000127985'],
    ])('returns %s for card number %s', (expectedBrand, cardNumber) => {
      const brand = EBANX.utils.creditCardScheme(cardNumber);

      expect(brand).toEqual(expectedBrand);
    });
  });
});
