import { ThreeDSecureInformation } from './types';

export class ThreeDSecureError extends Error {
  constructor(message?: string) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, ThreeDSecureError.prototype);
  }
}

export function getEci(info: ThreeDSecureInformation): string {
  const { consumerAuthenticationInformation: { eci, eciRaw } } = info;

  if (eci) {
    return eci;
  }

  if (eciRaw) {
    return eciRaw;
  }

  throw new ThreeDSecureError();
}

export function getCryptogram(info: ThreeDSecureInformation): string {
  const { consumerAuthenticationInformation: { ucaf, ucafAuthenticationData } } = info;

  if (ucaf) {
    return ucaf;
  }

  if (ucafAuthenticationData) {
    return ucafAuthenticationData;
  }

  throw new ThreeDSecureError();
}

export function getXId(info: ThreeDSecureInformation): string | undefined {
  return info.consumerAuthenticationInformation.xid;
}

export function getAscUrl(info: ThreeDSecureInformation): string {
  return info.consumerAuthenticationInformation.acsUrl;
}

export function getPareq(info: ThreeDSecureInformation): string {
  return info.consumerAuthenticationInformation.pareq;
}

export function getAuthenticationTransactionId(info: ThreeDSecureInformation): string {
  return info.consumerAuthenticationInformation.authenticationTransactionId;
}

export function getVersion(info: ThreeDSecureInformation): string | undefined {
  return info.consumerAuthenticationInformation.version;
}

export function getTrxId(info: ThreeDSecureInformation): string | undefined {
  return info.consumerAuthenticationInformation.directoryServerTransactionId;
}
