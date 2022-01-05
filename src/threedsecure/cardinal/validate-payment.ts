import { ThreeDSecureInformation, ThreeDSecureToken } from '../types';
import { getAscUrl, getPareq, getAuthenticationTransactionId, ThreeDSecureError } from '../three-d-secure-information';

export function validatePayment(threeDSecureInformation: ThreeDSecureInformation, threeDSecureToken: ThreeDSecureToken): Promise<any> {
  Cardinal.continue('cca', {
    AcsUrl: getAscUrl(threeDSecureInformation),
    Payload: getPareq(threeDSecureInformation),
  }, {
    OrderDetails: {
      TransactionId: getAuthenticationTransactionId(threeDSecureInformation),
    },
  });

  return new Promise<any>((resolve, reject) => {
    Cardinal.on('payments.validated', (decodedResponseData: any, jwt: string) => {
      if (jwt) {
        const actionCode = (!decodedResponseData.ActionCode && decodedResponseData.ErrorNumber != 0 ) ? 'ERROR' : 'SUCCESS';
        resolve({jwt, errorNumber: decodedResponseData.ErrorNumber, errorMessage: decodedResponseData.ErrorDescription, actionCode: actionCode});
      } else {
        reject(new ThreeDSecureError('Error to validate payment'));
      }
    });
  });
}
