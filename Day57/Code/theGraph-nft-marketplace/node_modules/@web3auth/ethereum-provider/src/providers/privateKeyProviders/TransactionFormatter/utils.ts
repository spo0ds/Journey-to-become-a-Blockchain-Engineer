import { SignTypedDataVersion, TYPED_MESSAGE_SCHEMA, TypedDataV1Field, typedSignatureHash } from "@metamask/eth-sig-util";
import { get } from "@toruslabs/http-helpers";
import { isHexStrict } from "@web3auth/base";
import assert from "assert";
import { BigNumber } from "bignumber.js";
import { ethErrors } from "eth-rpc-errors";
import { isValidAddress } from "ethereumjs-util";
import jsonschema from "jsonschema";

import { TypedMessageParams } from "../../../rpc/interfaces";
import { decGWEIToHexWEI, hexWEIToDecGWEI } from "../../converter";
import { EIP1159GasData, LegacyGasData } from "./interfaces";

export function normalizeGWEIDecimalNumbers(n: string | BigNumber): string {
  const numberAsWEIHex = decGWEIToHexWEI(n);
  const numberAsGWEI = hexWEIToDecGWEI(numberAsWEIHex);
  return numberAsGWEI;
}

export async function fetchEip1159GasEstimates(url: string): Promise<EIP1159GasData> {
  const estimates = await get<EIP1159GasData>(url);
  const normalizedEstimates = {
    ...estimates,
    estimatedBaseFee: normalizeGWEIDecimalNumbers(estimates.estimatedBaseFee),
    low: {
      ...estimates.low,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(estimates.low.suggestedMaxPriorityFeePerGas),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(estimates.low.suggestedMaxFeePerGas),
    },
    medium: {
      ...estimates.medium,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(estimates.medium.suggestedMaxPriorityFeePerGas),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(estimates.medium.suggestedMaxFeePerGas),
    },
    high: {
      ...estimates.high,
      suggestedMaxPriorityFeePerGas: normalizeGWEIDecimalNumbers(estimates.high.suggestedMaxPriorityFeePerGas),
      suggestedMaxFeePerGas: normalizeGWEIDecimalNumbers(estimates.high.suggestedMaxFeePerGas),
    },
  };
  return normalizedEstimates;
}

/**
 * Hit the legacy MetaSwaps gasPrices estimate api and return the low, medium
 * high values from that API.
 */
export async function fetchLegacyGasPriceEstimates(url: string): Promise<LegacyGasData> {
  const result = await get<{
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
  }>(url, {
    referrer: url,
    referrerPolicy: "no-referrer-when-downgrade",
    method: "GET",
    mode: "cors",
  });
  return {
    low: result.SafeGasPrice,
    medium: result.ProposeGasPrice,
    high: result.FastGasPrice,
  };
}

export const validateTypedMessageParams = (parameters: TypedMessageParams<unknown>, activeChainId: number) => {
  try {
    assert.ok(parameters && typeof parameters === "object", "Params must be an object.");
    assert.ok("data" in parameters, 'Params must include a "data" field.');
    assert.ok("from" in parameters, 'Params must include a "from" field.');
    assert.ok(
      typeof parameters.from === "string" && isValidAddress(parameters.from),
      '"from" field must be a valid, lowercase, hexadecimal Ethereum address string.'
    );
    let data = null;
    let chainId = null;
    switch ((parameters as TypedMessageParams<unknown>).version) {
      case SignTypedDataVersion.V1:
        if (typeof parameters.data === "string") {
          assert.doesNotThrow(() => {
            data = JSON.parse(parameters.data as string);
          }, '"data" must be a valid JSON string.');
        } else {
          // for backward compatiblity we validate for both string and object type.
          data = parameters.data;
        }
        assert.ok(Array.isArray(data as unknown), "params.data must be an array.");
        assert.doesNotThrow(() => {
          typedSignatureHash(data as TypedDataV1Field[]);
        }, "Signing data must be valid EIP-712 typed data.");
        break;
      case SignTypedDataVersion.V3:
      case SignTypedDataVersion.V4:
        if (typeof parameters.data === "string") {
          assert.doesNotThrow(() => {
            data = JSON.parse(parameters.data as string);
          }, '"data" must be a valid JSON string.');
        } else {
          // for backward compatiblity we validate for both string and object type.
          data = parameters.data;
        }

        assert.ok(data.primaryType in data.types, `Primary type of "${data.primaryType}" has no type definition.`);
        const validation = jsonschema.validate(data, TYPED_MESSAGE_SCHEMA.properties);
        assert.strictEqual(validation.errors.length, 0, "Signing data must conform to EIP-712 schema. See https://git.io/fNtcx.");
        chainId = data.domain?.chainId;
        if (chainId) {
          assert.ok(!Number.isNaN(activeChainId), `Cannot sign messages for chainId "${chainId}", because Web3Auth is switching networks.`);
          if (typeof chainId === "string") {
            chainId = Number.parseInt(chainId, isHexStrict(chainId) ? 16 : 10);
          }
          assert.strictEqual(chainId, activeChainId, `Provided chainId "${chainId}" must match the active chainId "${activeChainId}"`);
        }
        break;
      default:
        assert.fail(`Unknown typed data version "${(parameters as TypedMessageParams<unknown>).version}"`);
    }
  } catch (error) {
    throw ethErrors.rpc.invalidInput({
      message: error?.message,
    });
  }
};
