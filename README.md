# EBANX JS CHECKOUT V1.0.0

[![Build Status](https://travis-ci.com/ebanx/checkout-js.svg?token=fnHBQhvUoN1zMVexkAyq&branch=master)](https://travis-ci.com/ebanx/checkout-js)

EBANX JS CHECKOUT makes it easy to collect [payments in Brazil, Mexico, Chile, Colombia, Peru](), using local currencies and payment methods in an easy and secure way. If you need help please reach us at <developer support channel here>.

## Start using EBANXCheckout.js

### 1. Add this script to your page:

```html
<script type="text/javascript" src="https://js.ebanx.com/"></script>
```
### 2. Config

```javascript
EBANX.config.setMode('test'); // Set mode. production/test
EBANX.config.setPublishableKey('put your key here'); // Set your Publishable key. To identify your site to EBANX API you must start by providing your [publishable key](https://developers.ebanx.com/merchant-area/merchant-options).
EBANX.config.setCountry('br'); // Set your checkout country (see: https://en.wikipedia.org/wiki/ISO_3166-1).
```

This is all. Use: 

#### card.createToken

Creates a single use token used to pass credit-card information to your server in a safe way.

```javascript
var createTokenCallback = function(ebanxResponse) {
  if (ebanxResponse.error) {
      document.getElementById('status').textContent = 'Error ' + ebanxResponse.error.message;
  } else {
      document.getElementById('status').textContent = 'Success, the token is: ' + ebanxResponse.token;
  }
}

EBANX.card.createToken({
  card_number: document.getElementById('card-number').value,
  card_name: document.getElementById('card-name').value,
  card_due_date: document.getElementById('card-due-date').value,
  card_cvv: document.getElementById('card-cvv').value
}, createTokenCallback);
```

## Notes

- [x] EBANX Checkout JS Only works on HTTPS; 
