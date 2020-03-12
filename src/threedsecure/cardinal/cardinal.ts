import { ThreeDSecureToken, Card, ThreeDSecureInformation } from '../types';
import { getAscUrl, getPareq, getAuthenticationTransactionId } from '../three-d-secure-information';

export async function init(threeDSecureToken: ThreeDSecureToken, card: Card) {
  document.getElementById('Cardinal-ElementContainer')?.remove();

  Cardinal.configure({
    timeout: '8000',
    maxRequestRetries: '10',
    logging: {
      level: 'off',
    },
    payment: {
      view: 'modal',
      framework: 'boostrap3',
      displayLoading: true,
      displayExitButton: true,
    },
  });

  Cardinal.setup('init', {
    jwt: threeDSecureToken.accessToken,
  });

  Cardinal.on('payments.setupComplete', () => {
    Cardinal.trigger('bin.process', card);
  });
}


export function validatePayment(threeDSecureToken: ThreeDSecureToken, threeDSecureInformation: ThreeDSecureInformation): Promise<string> {
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
        reject(null);
      }
    });
  });
}
