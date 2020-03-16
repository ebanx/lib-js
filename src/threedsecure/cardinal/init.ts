import { ThreeDSecureToken, Card } from '../types';

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
