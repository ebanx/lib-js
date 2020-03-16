export interface ThreeDSecureToken {
  readonly accessToken: string;
  readonly paymentId: string;
}

export interface ThreeDSecureInformation {
  readonly status?:
  | 'PENDING_AUTHENTICATION'
  | 'VALIDATION_NEEDED'
  | 'AUTHENTICATION_SUCCESSFUL'
  | 'AUTHENTICATION_FAILED'
  ;

  readonly consumerAuthenticationInformation: CustomerAuthenticationInformation;
}

export interface CustomerAuthenticationInformation {
  readonly eci: string;
  readonly eciRaw: string;
  readonly ucaf: string;
  readonly ucafAuthenticationData: string;
  readonly xid: string;
  readonly acsUrl: string;
  readonly pareq: string;
  readonly authenticationTransactionId: string;
}

export interface PersonalIdentification {
  readonly id: string;
  readonly type: 'CPF' | 'CNPJ';
}

export interface Address {
  readonly address1: string;
  readonly administrativeArea: string;
  readonly country: string;
  readonly email: string;
  readonly homePhone: string;
  readonly locality: string;
  readonly postalCode: string;
  readonly mobilePhone: string;
}

export interface AmountDetails {
  readonly totalAmount: string;
  readonly currency: string;
}

export interface OrderInformation {
  readonly amountDetails: AmountDetails;
  readonly billTo: Address;
}

export interface Card {
  readonly number: string;
  readonly expirationMonth: string;
  readonly expirationYear: string;
  readonly type: string;
  readonly holderName: string;
}

export interface PaymentInformation {
  readonly card: Card;
}
