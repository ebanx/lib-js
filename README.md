# Lib JS  V1.5

Lib JS makes it easy to collect [payments in Brazil, Mexico, Chile, Colombia, Peru](https://www.ebanx.com/business/en/), using local currencies and payment methods in an easy and secure way. If you need help please reach us at <developer support channel here>.

Find more information in our [Dev Academy](https://www.ebanx.com/business/en/developers/integrations/lib-js).

## Start using EBANX Lib JS

### 1. Add this script to your page:

```html
<script type="text/javascript" src="https://js.ebanx.com/ebanx-1.5.min.js/"></script>
```
### 2. Config

```javascript
EBANX.config.setMode('sandbox'); // Set mode. production/test
EBANX.config.setPublishableKey('put your key here'); // Set your Publishable key. To identify your site to EBANX API you must start by providing your [publishable key](https://developers.ebanx.com/merchant-area/merchant-options).
EBANX.config.setCountry('br'); // Set your checkout country (Alpha-2) (see: https://en.wikipedia.org/wiki/ISO_3166-1).
```

This is all. Use:

#### card.createToken

Creates a single use token used to pass credit-card information to your server in a safe way.

```javascript
EBANX.config.setMode('test');
EBANX.config.setPublishableKey('YOUR KEY HERE');
EBANX.config.setCountry('br');

var createTokenCallback = function(ebanxResponse) {
  if (ebanxResponse.data.hasOwnProperty('status')) {
      document.getElementById('status').textContent = 'Success, the token is: ' + ebanxResponse.data.token;
  } else {
      var errorMessage = ebanxResponse.error.err.status_message || ebanxResponse.error.err.message;
      document.getElementById('status').textContent = 'Error ' + errorMessage;
  }
}

// CUSTOMER CLICKS THE BUTTON
function createToken() {
  EBANX.card.createToken({
    card_number: 4111111111111111,
    card_name: 'Teste',
    card_due_date: '02/2019',
    card_cvv: '123'
  }, createTokenCallback);
}
createToken();
```

## Notes

- [x] EBANX Checkout JS Only works on HTTPS;
