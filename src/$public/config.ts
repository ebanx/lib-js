const _private = {
  country: 'br',
  mode: 'test',
  publicKey: '',
};

export const config = {
  isLive: function () {
    return _private.mode === 'production';
  },
  setPublishableKey: function (key: string) {
    _private.publicKey = String(key);
  },
  setCountry: function (country: string) {
    EBANX.validator.config.validateCountry(country);

    _private.country = String(country);
  },
  setMode: function (mode: string) {
    EBANX.validator.config.validateMode(mode);

    _private.mode = mode;
  },
  getMode: function () {
    return _private.mode;
  },
  getPublishableKey: function () {
    if (_private.publicKey.trim() === '')
      throw new EBANX.errors.InvalidConfigurationError('Missing publishable key. You need set publishable key using the method EBANX.config.setPublishableKey.', 'publicKey');

    return _private.publicKey;
  },
  getCountry: function () {
    return _private.country;
  },
  getLocale: function () {
    const countryLocale = {
      br: 'pt_BR',
      mx: 'es',
      co: 'es',
      ar: 'es',
    };

    return countryLocale[EBANX.config.getCountry()];
  },
};
