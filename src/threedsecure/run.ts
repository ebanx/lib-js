import * as ws from './ws';
import { ThreeDSecureToken, ThreeDSecureInformation, ThreeDSecureOptions, DeviceInformation } from './types';
import * as cardinal from './cardinal';
import { getEci, getCryptogram, getXId, getVersion, getTrxId, getAuthenticationTransactionId, ThreeDSecureError } from './three-d-secure-information';

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
  const threeDSecureToken = await ws.generateToken(orderInformation.amountDetails, paymentInformation);
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
    const {jwt, actionCode, errorNumber, errorMessage} = await Promise.race([
      new Promise<any>((resolve, reject) => {
        setTimeout(() => {
          if (!actionCode) {
            ws.updateRecordStatus('TIMEOUT', threeDSecureToken.paymentId, '0001', 'Waited too much for payment validation');
          }
          reject(new Error('Waited too much for payment validation'));
        }, 60000);
      }),
      await cardinal.validatePayment(threeDSecureInformation, threeDSecureToken),
    ]);

    if (actionCode && actionCode != 'SUCCESS') {
      await ws.updateRecordStatus(actionCode, threeDSecureToken.paymentId, errorNumber, errorMessage);
      throw new Error('AUTHENTICATION_FAILED');
    }
    return buildThreeDSecureResponse(
      await ws.authenticationResults(threeDSecureToken, orderInformation, paymentInformation, getAuthenticationTransactionId(threeDSecureInformation), jwt)
    );
  }

  async function validationNeeded(threeDSecureToken: ThreeDSecureToken) {
    return buildThreeDSecureResponse(
      await ws.authenticationResults(threeDSecureToken, orderInformation, paymentInformation, getAuthenticationTransactionId(threeDSecureInformation))
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
