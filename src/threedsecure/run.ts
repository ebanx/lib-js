import * as ws from './ws';
import { OrderInformation, PaymentInformation, PersonalIdentification, ThreeDSecureToken, ThreeDSecureInformation, ThreeDSecureAuthentications } from './types';
import * as cardinal from './cardinal';
import { getEci, getCryptogram, getXId, ThreeDSecureError } from './three-d-secure-information';

type RunArgs = {
  orderInformation: OrderInformation;
  paymentInformation: PaymentInformation;
  personalIdentification: PersonalIdentification;
  installmentTotalCount: string;
}

export async function run({
  orderInformation,
  paymentInformation,
  personalIdentification,
  installmentTotalCount,
}: ThreeDSecureAuthentications) {
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
    const jwt = await cardinal.validatePayment(threeDSecureToken, threeDSecureInformation);
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


function buildThreeDSecureResponse(threeDSecureInformation: ThreeDSecureInformation) {
  if (threeDSecureInformation.status !== 'AUTHENTICATION_SUCCESSFUL') {
    throw new ThreeDSecureError(threeDSecureInformation.status);
  }

  return {
    /* eslint-disable @typescript-eslint/camelcase */
    three_eci: getEci(threeDSecureInformation),
    three_cryptogram: getCryptogram(threeDSecureInformation),
    three_xid: getXId(threeDSecureInformation),
    /* eslint-enable @typescript-eslint/camelcase */
  };
}
