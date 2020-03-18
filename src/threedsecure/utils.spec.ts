import { getCardType } from './utils';

describe('getCardType', () => {
  it('should return type for visa', () => {
    expect(getCardType('visa')).toBe('001');
  });

  it('should return type for mastercard', () => {
    expect(getCardType('mastercard')).toBe('002');
  });

  it('should return type for maestro', () => {
    expect(getCardType('maestro')).toBe('042');
  });

  it('should return type for elo', () => {
    expect(getCardType('elo')).toBe('054');
  });
});
