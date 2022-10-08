import { BigNumber } from "bignumber.js";
import { addHexPrefix, BN, stripHexPrefix } from "ethereumjs-util";

export function bnLessThan(a, b) {
  if (a === null || a === undefined || b === null || b === undefined) {
    return null;
  }
  return new BigNumber(a, 10).lt(b, 10);
}

export function bnToHex(inputBn: BN) {
  return addHexPrefix(inputBn.toString(16));
}

export function hexToBn(inputHex: string): BN {
  if (BN.isBN(inputHex)) return inputHex;
  return new BN(stripHexPrefix(inputHex), 16);
}

export function BnMultiplyByFraction(targetBN: BN, numerator: number | string, denominator: number | string): BN {
  const numberBN = new BN(numerator);
  const denomBN = new BN(denominator);
  return targetBN.mul(numberBN).div(denomBN);
}
