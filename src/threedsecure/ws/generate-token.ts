import { ThreeDSecureToken, AmountDetails } from '../types';

export async function generateToken(amountDetails: AmountDetails): Promise<ThreeDSecureToken> {
  const url = new URL('/ws/threedsecureserver-generateToken', EBANX.utils.api.path());

  const data = {
    totalAmount: amountDetails.totalAmount,
    currency: amountDetails.currency,
    orderNumber: null,
    consumerAuthenticationInformation: {
      overridePaymentMethod: 'DEBIT',
    },
  };

  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(data),
  });

  const { data: [threeDSecureToken] } = await response.json();

  return threeDSecureToken;
}
