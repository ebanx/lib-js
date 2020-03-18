import * as ws from './ws';
import { OrderInformation, PaymentInformation, PersonalIdentification, ThreeDSecureToken, ThreeDSecureInformation } from './types';
import * as cardinal from './cardinal';
import { getEci, getCryptogram, getXId, ThreeDSecureError } from './three-d-secure-information';

interface ThreeDSecureOptions {
  readonly orderInformation: OrderInformation;
  readonly paymentInformation: PaymentInformation;
  readonly personalIdentification: PersonalIdentification;
  readonly installmentTotalCount?: string;
}

interface ThreeDSecureResponse {
  readonly three_eci: string;
  readonly three_cryptogram: string;
  readonly three_xid?: string;
}

export async function run({
  orderInformation,
  paymentInformation,
  personalIdentification,
  installmentTotalCount = '1',
}: ThreeDSecureOptions): Promise<ThreeDSecureResponse> {
  const threeDSecureToken = await ws.generateToken(orderInformation.amountDetails);

  await cardinal.init(threeDSecureToken, paymentInformation.card);

  const threeDSecureInformation = await ws.authentications(threeDSecureToken, orderInformation, paymentInformation, personalIdentification, installmentTotalCount);

  switch (threeDSecureInformation.status) {
    case 'PENDING_AUTHENTICATION':
      return pendingAuthentication(threeDSecureToken, threeDSecureInformation);
    case 'VALIDATION_NEEDED':
      return validationNeeded(threeDSecureToken);
    case 'AUTHENTICATION_FAILED':
    case 'AUTHENTICATION_SUCCESSFUL':
    default:
      return buildThreeDSecureResponse(threeDSecureInformation);
  }


  async function pendingAuthentication(threeDSecureToken: ThreeDSecureToken, threeDSecureInformation: ThreeDSecureInformation) {
    const jwt = await cardinal.validatePayment(threeDSecureInformation);
    return buildThreeDSecureResponse(
      await ws.authenticationResults(threeDSecureToken, orderInformation, paymentInformation, jwt)
    );
  }

  async function validationNeeded(threeDSecureToken: ThreeDSecureToken) {
    return buildThreeDSecureResponse(
      await ws.authenticationResults(threeDSecureToken, orderInformation, paymentInformation)
    );
  }
}


function buildThreeDSecureResponse(threeDSecureInformation: ThreeDSecureInformation): ThreeDSecureResponse {
  if (threeDSecureInformation.status !== 'AUTHENTICATION_SUCCESSFUL') {
    throw new ThreeDSecureError(threeDSecureInformation.status);
  }

  return {
    three_eci: getEci(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    three_cryptogram: getCryptogram(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    three_xid: getXId(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
  };
}
