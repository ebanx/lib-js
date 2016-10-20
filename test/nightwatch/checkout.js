/* jshint expr: true */

var mock = {
  url: {
    host: 'http://127.0.0.1:8080/'
  }
};

module.exports = {
  'Custom form test': function (browser) {
    mock.DOM = {
      title: "EBANX | Checkout - Custom form",
      textFields: {
        country: 'input#country-abbreviation'
      },
      containers: {
        creditCard: 'div[data-ebanx="credit-card-container"]'
      },
      buttons: {
        saveAddress: 'button#btn-save-customer-data'
      }
    };

    mock.url.page = 'checkout-custom-form.html';
    mock.url.endpoint = mock.url.host+mock.url.page;

    browser
      .maximizeWindow()
      .url(mock.url.endpoint)
      .assert.title(mock.DOM.title)
      .assert.visible(mock.DOM.textFields.country)
      .setValue(mock.DOM.textFields.country, 'BR')
    ;

    browser
      .assert
      .hidden(mock.DOM.containers.creditCard)
    ;

    browser
      .click(mock.DOM.buttons.saveAddress)
    ;

    // 4111111111111111

    browser.end();
  }
};