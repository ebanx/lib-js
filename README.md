# EBANX JS CHECKOUT V1.0.0

[![Build Status](https://travis-ci.com/ebanx/checkout-js.svg?token=fnHBQhvUoN1zMVexkAyq&branch=master)](https://travis-ci.com/ebanx/checkout-js)

EBANX JS CHECKOUT makes it easy to collect [payments in Brazil, Mexico, Chile, Colombia, Peru](), using local currencies and payment methods in an easy and secure way. If you need help please reach us at <developer support channel here>.

## Start using EBANXCheckout.js

### 1. Add this script to your page:

```html
<script type="text/javascript" src="https://js.ebanx.com/"></script>
```
### 2. Set your Publishable key.

To identify your site to EBANX API you must start by providing your [publishable key](https://developers.ebanx.com/merchant-area/merchant-options).

```javascript
EBANX.config.setPublishableKey('put your key here');
```

### 3. Create a credit card request

Lets start by collecting credit card details and preparing a request token, please notice that other payment methods are also supported, see [payment methods]().

#### card.createToken

Creates a single use token used to pass credit card information to your server in a safe way.

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

-------- Prepare request alternative

#### card.createRequest

Creates a single use token used to pass credit card information to your server in a safe way.

```javascript
var createTokenCallback = function(ebanxResponse) {
  if (ebanxResponse.error) {
      document.getElementById('status').textContent = 'Error ' + ebanxResponse.error.message;
  } else {
      document.getElementById('status').textContent = 'Success, the token is: ' + ebanxResponse.token;
  }
}

EBANX.card.prepareRequest({
  customer_name: document.getElementById('customer_name').value,
  customer_email: document.getElementById('customer_email').value,
  customer_document: document.getElementById('customer_document').value,
  customer_birth_date: document.getElementById('customer_birth_date').value,
  customer_zipcode: document.getElementById('customer_zipcode').value,
  customer_address: document.getElementById('customer_address').value,
  customer_street_number: document.getElementById('customer_street_number').value,
  customer_city: document.getElementById('customer_city').value,
  customer_state: document.getElementById('customer_state').value,
  country: document.getElementById('customer_country').value,
  currency_code: "BRL",
  ammount_total: "100.00",
  card_number: document.getElementById('card-number').value,
  card_name: document.getElementById('card-name').value,
  card_due_date: document.getElementById('card-due-date').value,
  card_cvv: document.getElementById('card-cvv').value
}, createTokenCallback);
```


## Notes

- [x] EBANX Checkout JS Only works on HTTPS;
