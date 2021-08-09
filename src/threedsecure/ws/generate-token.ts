import { ThreeDSecureToken, AmountDetails, PaymentInformation } from '../types';

export async function generateToken(amountDetails: AmountDetails, paymentInformation: PaymentInformation): Promise<ThreeDSecureToken> {
  const url = new URL('/ws/threedsecureserver-generateToken', EBANX.utils.api.path());

  const data = {
    totalAmount: amountDetails.totalAmount,
    currency: amountDetails.currency,
    orderNumber: null,
    consumerAuthenticationInformation: {
      overridePaymentMethod: 'DEBIT',
    },
    publicIntegrationKey: EBANX.config.getPublishableKey(),
    paymentInformation: paymentInformation,
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
