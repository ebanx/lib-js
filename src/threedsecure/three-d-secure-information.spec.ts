import faker from 'faker';

import { getEci, ThreeDSecureError, getCryptogram, getXId, getAscUrl } from './three-d-secure-information';
import { ThreeDSecureInformation } from './types';

let consumerAuthenticationInformation: ThreeDSecureInformation['consumerAuthenticationInformation'];

beforeEach(() => {
  consumerAuthenticationInformation = {
    eciRaw: faker.random.uuid(),
    eci: faker.random.uuid(),
    acsUrl: faker.random.uuid(),
    authenticationTransactionId: faker.random.uuid(),
    pareq: faker.random.uuid(),
    ucaf: faker.random.uuid(),
    ucafAuthenticationData: faker.random.uuid(),
    xid: faker.random.uuid(),
  };
});

describe('getEci', () => {
  it('should return aci', () => {
    const eci = faker.random.uuid();

    expect(getEci({
      consumerAuthenticationInformation:
      {
        ...consumerAuthenticationInformation,
        eci,
      },
    })).toBe(eci);

    expect(getEci({
      consumerAuthenticationInformation: {
        ...consumerAuthenticationInformation,
        eci,
        eciRaw: '',
      },
    })).toBe(eci);
  });

  it('should return eciRaw', () => {
    const eciRaw = faker.random.uuid();

    expect(getEci({
      consumerAuthenticationInformation: {
        ...consumerAuthenticationInformation,
        eci: '',
        eciRaw,
      },
    })).toBe(eciRaw);
  });

  it('should throw ThreeDSecureError', () => {
    expect(() => {
      getEci({
        consumerAuthenticationInformation: {
          ...consumerAuthenticationInformation,
          eci: '',
          eciRaw: '',
        },
      });
    }).toThrow(ThreeDSecureError);
  });
});


describe('getCryptogram', () => {
  it('should return ucaf', () => {
    const ucaf = faker.random.uuid();

    expect(getCryptogram({
      consumerAuthenticationInformation:
      {
        ...consumerAuthenticationInformation,
        ucaf,
      },
    })).toBe(ucaf);

    expect(getCryptogram({
      consumerAuthenticationInformation: {
        ...consumerAuthenticationInformation,
        ucaf,
        ucafAuthenticationData: '',
      },
    })).toBe(ucaf);
  });

  it('should return ucafAuthenticationData', () => {
    const ucafAuthenticationData = faker.random.uuid();

    expect(getCryptogram({
      consumerAuthenticationInformation: {
        ...consumerAuthenticationInformation,
        ucaf: '',
        ucafAuthenticationData,
      },
    })).toBe(ucafAuthenticationData);
  });

  it('should throw ThreeDSecureError', () => {
    expect(() => {
      getCryptogram({
        consumerAuthenticationInformation: {
          ...consumerAuthenticationInformation,
          ucaf: '',
          ucafAuthenticationData: '',
        },
      });
    }).toThrow(ThreeDSecureError);
  });
});


describe('getXId', () => {
  it('should return xid', () => {
    const xid = faker.random.uuid();

    expect(getXId({
      consumerAuthenticationInformation:
      {
        ...consumerAuthenticationInformation,
        xid,
      },
    })).toBe(xid);
  });
});

describe('getAscUrl', () => {
  it('should return acsUrl', () => {
    const acsUrl = faker.random.uuid();

    expect(getAscUrl({
      consumerAuthenticationInformation:
      {
        ...consumerAuthenticationInformation,
        acsUrl,
      },
    })).toBe(acsUrl);
  });
});
