import faker from 'faker';
import { getCardType, checkIfShouldAuthenticate, getPaymentMethod } from './utils';
import { OrderInformation, PaymentInformation, PersonalIdentification, ThreeDSecureOptions } from './types';

describe('getCardType', () => {
  it('should return type for visa', () => {
    expect(getCardType('visa')).toBe('001');
  });

  it('should return type for mastercard', () => {
    expect(getCardType('mastercard')).toBe('002');
  });

  it('should return type for maestro', () => {
    expect(getCardType('maestro')).toBe('042');
  });

  it('should return type for elo', () => {
    expect(getCardType('elo')).toBe('054');
  });
});

describe('checkIfShouldPerformAuthentication', () => {
  it('should return true for card numbers with unknown bin', async () => {
    const options = getThreeDSecureOptions();
    Object.assign(options.paymentInformation.card, { number: '40672223452452467543' });
    await expect(checkIfShouldAuthenticate(options))
      .resolves.toBe(true);
  });

  it('should return false for Caixa\'s bins', async () => {
    const caixaBins = [
      '506722',
      '509023',
      '509030',
      '509105',
      '439267',
    ];

    for (const bin of caixaBins) {
      const number = `${bin}${faker.helpers.replaceSymbolWithNumber('##########')}`;

      const options = getThreeDSecureOptions();
      Object.assign(options.paymentInformation.card, { number });

      await expect(checkIfShouldAuthenticate(options))
        .resolves.toBe(false);
    }
  });
});

describe('getPaymentMethod', () => {
  it('should return DEBIT for debitcard', () => {
    expect(getPaymentMethod('debitcard')).toBe('DEBIT');
  });

  it('should return CREDIT for creditcard', () => {
    expect(getPaymentMethod('creditcard')).toBe('CREDIT');
  });

  it('should return DEBIT for any other card type', () => {
    expect(getPaymentMethod('anyother')).toBe('DEBIT');
  });

  it('should return DEBIT when card type is empty', () => {
    expect(getPaymentMethod()).toBe('DEBIT');
  });
});

function getThreeDSecureOptions() {
  const orderInformation: OrderInformation = {
    amountDetails: {
      totalAmount: '10.04',
      currency: 'BRL',
    },
    billTo: {
      address1: 'Rua Estanislau Szarek',
      administrativeArea: 'PR',
      country: 'BR',
      email: '1584023172@exemplo.com.br',
      homePhone: '41999999999',
      locality: 'Curitiba',
      postalCode: '81315380',
      mobilePhone: '41999999999',
    },
  };

  const paymentInformation: PaymentInformation = {
    card: {
      number: '4000000000001091',
      expirationMonth: '12',
      expirationYear: '34',
      type: getCardType('visa'),
      holderName: 'JOAO DA SILVA',
    },
  };

  const personalIdentification: PersonalIdentification = {
    id: '97370192024',
    type: 'CPF',
  };

  const installmentTotalCount = '1';

  const options: ThreeDSecureOptions = {
    orderInformation,
    paymentInformation,
    personalIdentification,
    installmentTotalCount,
  };

  return options;
}
