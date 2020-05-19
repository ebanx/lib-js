import * as ws from './ws';
import { ThreeDSecureToken, ThreeDSecureInformation, ThreeDSecureOptions } from './types';
import * as cardinal from './cardinal';
import { getEci, getCryptogram, getXId, ThreeDSecureError } from './three-d-secure-information';

interface ThreeDSecureResponse {
  readonly threeds_eci: string;
  readonly threeds_cryptogram: string;
  readonly threeds_xid?: string;
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
    threeds_eci: getEci(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    threeds_cryptogram: getCryptogram(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    threeds_xid: getXId(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
  };
}
