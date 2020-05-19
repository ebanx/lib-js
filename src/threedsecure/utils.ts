import { ThreeDSecureError } from './three-d-secure-information';
import { ThreeDSecureOptions } from './types';

type Schema =
  | 'visa'
  | 'mastercard'
  | 'maestro'
  | 'elo'
  ;

export function getCardType(schema: Schema): string {
  switch (schema) {
    case 'visa':
      return '001';
    case 'mastercard':
      return '002';
    case 'maestro':
      return '042';
    case 'elo':
      return '054';
    default:
      throw new ThreeDSecureError('Schema not mapped');
  }
}

export async function checkIfShouldAuthenticate(options: ThreeDSecureOptions): Promise<boolean> {
  const CARD_BIN_WHITELIST = [
    '506722',
  ];

  const cardBin = options.paymentInformation.card.number.substr(0, 6);

  return !CARD_BIN_WHITELIST.includes(cardBin);
}
