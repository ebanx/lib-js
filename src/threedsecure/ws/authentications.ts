import { ThreeDSecureToken, PaymentInformation, OrderInformation, PersonalIdentification, ThreeDSecureInformation, DeviceInformation } from '../types';
import { getPaymentMethod } from '../utils';

export async function authentications(
  threeDSecureToken: ThreeDSecureToken,
  orderInformation: OrderInformation,
  paymentInformation: PaymentInformation,
  personalIdentification: PersonalIdentification,
  installmentTotalCount = '1',
  deviceInformation: DeviceInformation,
): Promise<ThreeDSecureInformation> {


  const data = {
    token: threeDSecureToken.accessToken,
    merchantTrackId: threeDSecureToken.paymentId,
    additionalData: JSON.stringify({
      publicIntegrationKey: EBANX.config.getPublishableKey(),
    }),
    orderInformation,
    consumerAuthenticationInformation: {
      installmentTotalCount,
      overridePaymentMethod: getPaymentMethod(paymentInformation.paymentMethod),
    },
    personalIdentification,
    paymentInformation,
    deviceInformation,
  };

  const url = new URL('/ws/threedsecureserver-authentications', EBANX.utils.api.path());

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
