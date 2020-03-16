import faker from 'faker';

jest.mock('./cardinal');
jest.mock('./ws');

import * as ws from './ws';
import * as cardinal from './cardinal';

import { getCardType } from './utils';
import { PersonalIdentification, OrderInformation, PaymentInformation, ThreeDSecureInformation, ThreeDSecureToken } from './types';
import { run } from './run';

const wsMock = ws as unknown as Record<keyof typeof ws, jest.Mock>;
const cardinalMock = cardinal as unknown as Record<keyof typeof cardinal, jest.Mock>;

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

const options = {
  orderInformation,
  paymentInformation,
  personalIdentification,
  installmentTotalCount,
};

let threeDSecureToken: ThreeDSecureToken | null = null;
let threeDSecureInformation: ThreeDSecureInformation | null = null;

describe('run', () => {
  beforeEach(() => {
    threeDSecureToken = {
      accessToken: faker.random.uuid(),
      paymentId: faker.random.uuid(),
    };

    threeDSecureInformation = {
      status: 'AUTHENTICATION_SUCCESSFUL',
      consumerAuthenticationInformation: {
        eciRaw: faker.random.uuid(),
        eci: faker.random.uuid(),
        acsUrl: faker.random.uuid(),
        authenticationTransactionId: faker.random.uuid(),
        pareq: faker.random.uuid(),
        ucaf: faker.random.uuid(),
        ucafAuthenticationData: faker.random.uuid(),
        xid: faker.random.uuid(),
      },
    };

    wsMock.generateToken.mockReturnValue(Promise.resolve(threeDSecureToken) as ReturnType<typeof ws.generateToken>);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('flow without challenge and and without validation', () => {
    beforeEach(() => {
      wsMock.authentications.mockReturnValueOnce(Promise.resolve({
        ...threeDSecureInformation,
        status: 'AUTHENTICATION_SUCCESSFUL',
      }) as ReturnType<typeof ws.authentications>);
    });

    it('should authenticate', async () => {
      const result = await run(options);

      expect(cardinalMock.validatePayment.mock.calls.length).toBe(0);

      expect(result.three_cryptogram).toBe(threeDSecureInformation?.consumerAuthenticationInformation.ucaf);
      expect(result.three_eci).toBe(threeDSecureInformation?.consumerAuthenticationInformation.eci);
      expect(result.three_xid).toBe(threeDSecureInformation?.consumerAuthenticationInformation.xid);
    });

    it('should call ws.generateToken once', async () => {
      await run(options);
      expect(wsMock.generateToken.mock.calls.length).toBe(1);
    });

    it('should call cardinal.init once', async () => {
      await run(options);
      expect(cardinalMock.init.mock.calls[0]).toEqual([
        threeDSecureToken,
        paymentInformation.card,
      ]);
      expect(cardinalMock.init.mock.calls.length).toBe(1);
    });

    it('should call ws.authentications once', async () => {
      await run(options);
      expect(wsMock.authentications.mock.calls.length).toBe(1);
    });
  });

  describe('flow without challenge and with validation', () => {
    beforeEach(() => {
      wsMock.authentications.mockReturnValueOnce(Promise.resolve({
        ...threeDSecureInformation,
        status: 'VALIDATION_NEEDED',
      }) as ReturnType<typeof ws.authentications>);

      wsMock.authenticationResults.mockReturnValueOnce(Promise.resolve({
        ...threeDSecureInformation,
        status: 'AUTHENTICATION_SUCCESSFUL',
      }) as ReturnType<typeof ws.authentications>);
    });

    it('should authenticate', async () => {
      const result = await run(options);

      expect(cardinalMock.validatePayment.mock.calls.length).toBe(0);

      expect(result.three_cryptogram).toBe(threeDSecureInformation?.consumerAuthenticationInformation.ucaf);
      expect(result.three_eci).toBe(threeDSecureInformation?.consumerAuthenticationInformation.eci);
      expect(result.three_xid).toBe(threeDSecureInformation?.consumerAuthenticationInformation.xid);
    });

    it('should call cardinal.init once', async () => {
      await run(options);
      expect(cardinalMock.init.mock.calls[0]).toEqual([
        threeDSecureToken,
        paymentInformation.card,
      ]);
      expect(cardinalMock.init.mock.calls.length).toBe(1);
    });

    it('should call ws.generateToken once', async () => {
      await run(options);
      expect(wsMock.generateToken.mock.calls.length).toBe(1);
    });

    it('should call ws.authentications once', async () => {
      await run(options);
      expect(wsMock.authentications.mock.calls.length).toBe(1);
    });

    it('should call ws.authenticationResults once', async () => {
      await run(options);
      expect(wsMock.authenticationResults.mock.calls.length).toBe(1);
    });
  });

  describe('flow with challenge and with validation', () => {
    beforeEach(() => {
      wsMock.authentications.mockReturnValueOnce(Promise.resolve({
        ...threeDSecureInformation,
        status: 'PENDING_AUTHENTICATION',
      }) as ReturnType<typeof ws.authentications>);

      wsMock.authenticationResults.mockReturnValueOnce(Promise.resolve({
        ...threeDSecureInformation,
        status: 'AUTHENTICATION_SUCCESSFUL',
      }) as ReturnType<typeof ws.authentications>);

      cardinalMock.validatePayment.mockReturnValueOnce(Promise.resolve(faker.random.uuid()) as ReturnType<typeof cardinal.validatePayment>);
    });

    it('should authenticate', async () => {
      const result = await run(options);
      expect(result.three_cryptogram).toBe(threeDSecureInformation?.consumerAuthenticationInformation.ucaf);
      expect(result.three_eci).toBe(threeDSecureInformation?.consumerAuthenticationInformation.eci);
      expect(result.three_xid).toBe(threeDSecureInformation?.consumerAuthenticationInformation.xid);
    });

    it('should call ws.generateToken once', async () => {
      await run(options);
      expect(wsMock.generateToken.mock.calls.length).toBe(1);
    });

    it('should call cardinal.init once', async () => {
      await run(options);
      expect(cardinalMock.init.mock.calls.length).toBe(1);
    });

    it('should call ws.authentications once', async () => {
      await run(options);
      expect(wsMock.authentications.mock.calls.length).toBe(1);
    });

    it('should call cardinal.validatePayment once', async () => {
      await run(options);
      expect(cardinalMock.validatePayment.mock.calls.length).toBe(1);
    });

    it('should call ws.authenticationResults once', async () => {
      await run(options);
      expect(wsMock.authenticationResults.mock.calls.length).toBe(1);
    });
  });
});
