import spanishErrorMessages from './translations/es.json';
import portugueseErrorMessages from './translations/br.json';

export const errors = {
  summary: {
    // eslint-disable-next-line @typescript-eslint/camelcase
    pt_BR: portugueseErrorMessages,
    es: spanishErrorMessages,
  },
  InvalidValueFieldError: function (message: string, field: string) {
    this.message = EBANX.errors.summary[EBANX.config.getLocale()][message] || message;
    this.field = field;
    this.name = 'InvalidValueFieldError';
  },
  InvalidConfigurationError: function (message, config) {
    this.message = EBANX.errors.summary[EBANX.config.getLocale()][message] || message;
    this.invalidConfiguration = config;
    this.name = 'InvalidConfigurationError';
  },
};
