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
      throw new Error('Schema not mapped');
  }
}
