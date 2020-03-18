import { ThreeDSecureInformation } from '../types';
import { getAscUrl, getPareq, getAuthenticationTransactionId, ThreeDSecureError } from '../three-d-secure-information';

export function validatePayment(threeDSecureInformation: ThreeDSecureInformation): Promise<string> {
  Cardinal.continue('cca', {
    AcsUrl: getAscUrl(threeDSecureInformation),
    Payload: getPareq(threeDSecureInformation),
  }, {
    OrderDetails: {
      TransactionId: getAuthenticationTransactionId(threeDSecureInformation),
    },
  });


  return new Promise<string>((resolve, reject) => {
    setTimeout(() => reject(new Error('Waited too much for payment validation')), 60000);

    Cardinal.on('payments.validated', (decodedResponseData: unknown, jwt: string) => {
      if (jwt) {
        resolve(jwt);
      } else {
        reject(new ThreeDSecureError('Error to validate payment'));
      }
    });
  });
}
