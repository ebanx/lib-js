import { ThreeDSecureToken,  ThreeDSecureInformation, OrderInformation, PaymentInformation } from '../types';

export async function authenticationResults(
  threeDSecureToken: ThreeDSecureToken,
  orderInformation: OrderInformation,
  paymentInformation: PaymentInformation,
  authenticationTransactionId: string,
  tokenChallenge?: string
): Promise<ThreeDSecureInformation> {
  const url = new URL('/ws/threedsecureserver-authentication-results', EBANX.utils.api.path());

  const data = {
    token: threeDSecureToken.accessToken,
    tokenChallenge: tokenChallenge,
    merchantTrackId: threeDSecureToken.paymentId,
    paymentInformation,
    consumerAuthenticationInformation: {
      overridePaymentMethod: 'DEBIT',
      authenticationTransactionId: authenticationTransactionId,
    },
    orderInformation,
    publicIntegrationKey: EBANX.config.getPublishableKey(),
  };

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(data),
  });

  const { data: [threeDSecureInformation] } = await response.json();

  return threeDSecureInformation;
}
