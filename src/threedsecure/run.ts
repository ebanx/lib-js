import * as ws from './ws';
import { ThreeDSecureToken, ThreeDSecureInformation, ThreeDSecureOptions, DeviceInformation } from './types';
import * as cardinal from './cardinal';
import { getEci, getCryptogram, getXId, getVersion, getTrxId, ThreeDSecureError } from './three-d-secure-information';

interface ThreeDSecureResponse {
  readonly threeds_eci: string;
  readonly threeds_cryptogram: string;
  readonly threeds_xid?: string;
  readonly threeds_version?: string;
  readonly threeds_trxid?: string;
}

export async function run({
  orderInformation,
  paymentInformation,
  personalIdentification,
  installmentTotalCount = '1',
}: ThreeDSecureOptions): Promise<ThreeDSecureResponse> {
  const threeDSecureToken = await ws.generateToken(orderInformation.amountDetails);

  await cardinal.init(threeDSecureToken, paymentInformation.card);

  const deviceInformation = getDeviceInformation();
  const threeDSecureInformation = await ws.authentications(threeDSecureToken, orderInformation, paymentInformation, personalIdentification, installmentTotalCount, deviceInformation);

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

function getDeviceInformation(): DeviceInformation {
  return  {
    httpBrowserColorDepth: window.screen['colorDepth'].toString(),
    httpBrowserJavaEnabled: window.navigator['javaEnabled']() ? 'Y' : 'N',
    httpBrowserJavaScriptEnabled: 'Y',
    httpBrowserLanguage: window.navigator['language'],
    httpBrowserScreenHeight: window['innerHeight'].toString(),
    httpBrowserScreenWidth: window['innerWidth'].toString(),
    httpBrowserTimeDifference: new Date().getTimezoneOffset().toString(),
    userAgentBrowserValue: window.navigator['userAgent'],
  };
}

function buildThreeDSecureResponse(threeDSecureInformation: ThreeDSecureInformation): ThreeDSecureResponse {
  if (threeDSecureInformation.status !== 'AUTHENTICATION_SUCCESSFUL') {
    throw new ThreeDSecureError(threeDSecureInformation.status);
  }

  return {
    threeds_eci: getEci(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    threeds_cryptogram: getCryptogram(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    threeds_xid: getXId(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    threeds_version: getVersion(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
    threeds_trxid: getTrxId(threeDSecureInformation),// eslint-disable-line @typescript-eslint/camelcase
  };
}
