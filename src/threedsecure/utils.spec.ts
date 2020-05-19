import { getCardType, checkIfShouldAuthenticate } from './utils';
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
  it('should return true for card numbers with bin other than 506722', async () => {
    const options = getThreeDSecureOptions();
    Object.assign(options.paymentInformation.card, { number: '40672223452452467543' });
    await expect(checkIfShouldAuthenticate(options))
      .resolves.toBe(true);
  });

  it('should return false for card numbers with bin 506722', async () => {
    const options = getThreeDSecureOptions();
    Object.assign(options.paymentInformation.card, { number: '50672223452452467543' });
    await expect(checkIfShouldAuthenticate(options))
      .resolves.toBe(false);
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
