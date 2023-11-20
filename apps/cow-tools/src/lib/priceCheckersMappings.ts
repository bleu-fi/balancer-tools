import { goerli } from "viem/chains";

import { PRICE_CHECKERS, PriceCheckerArgument } from "./types";

export const priceCheckersArgumentsMapping = {
  [PRICE_CHECKERS.FIXED_MIN_OUT]: [
    {
      name: "minOut",
      type: "uint256",
      label: "Token to buy minimum amount",
      inputType: "number",
      convertInput: (input: number, decimals: number) =>
        BigInt(input * 10 ** decimals),
      convertOutput: (output: bigint, decimals: number) =>
        Number(output) / 10 ** decimals,
      toExpectedOutCalculator: false,
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.UNI_V2]: [
    {
      name: "allowedSlippageInBps",
      type: "uint256",
      label: "Allowed slippage (%)",
      inputType: "number",
      convertInput: (input: number) => BigInt(input * 100),
      convertOutput: (output: bigint) => Number(output) / 100,
      toExpectedOutCalculator: false,
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.BALANCER]: [
    {
      name: "allowedSlippageInBps",
      type: "uint256",
      label: "Allowed slippage (%)",
      inputType: "number",
      convertInput: (input: number) => BigInt(input * 100),
      convertOutput: (output: bigint) => Number(output) / 100,
      toExpectedOutCalculator: false,
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.SUSHI_SWAP]: [
    {
      name: "allowedSlippageInBps",
      type: "uint256",
      label: "Allowed slippage (%)",
      inputType: "number",
      convertInput: (input: number) => BigInt(input * 100),
      convertOutput: (output: bigint) => Number(output) / 100,
      toExpectedOutCalculator: false,
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.CHAINLINK]: [
    {
      name: "allowedSlippageInBps",
      type: "uint256",
      label: "Allowed slippage (%)",
      inputType: "number",
      convertInput: (input: number) => BigInt(input * 100),
      convertOutput: (output: bigint) => Number(output) / 100,
      toExpectedOutCalculator: false,
    },
    {
      name: "addressesPriceFeeds",
      type: "address[]",
      label: "Price feeds",
      inputType: "text",
      toExpectedOutCalculator: true,
      convertInput: (input: string) => input,
      convertOutput: (output: string) => output,
    },
    {
      name: "revertPriceFeeds",
      type: "bool[]",
      label: "Revert price feeds",
      inputType: "checkbox",
      toExpectedOutCalculator: true,
      convertInput: (input: boolean) => input,
      convertOutput: (output: boolean) => output,
    },
  ] as PriceCheckerArgument[],
  [PRICE_CHECKERS.UNI_V3]: [
    {
      name: "allowedSlippageInBps",
      type: "uint256",
      label: "Allowed slippage (%)",
      inputType: "number",
      convertInput: (input: number) => BigInt(input * 100),
      convertOutput: (output: bigint) => Number(output) / 100,
      toExpectedOutCalculator: false,
    },
    {
      name: "tokenIn",
      type: "address[]",
      label: "Token In",
      inputType: "text",
      toExpectedOutCalculator: true,
      convertInput: (input: string) => input,
      convertOutput: (output: string) => output,
    },
    {
      name: "tokenOut",
      type: "address[]",
      label: "Token Out",
      inputType: "text",
      toExpectedOutCalculator: true,
      convertInput: (input: string) => input,
      convertOutput: (output: string) => output,
    },
    {
      name: "fees",
      type: "uint24[]",
      label: "Fees (%)",
      inputType: "number",
      step: 0.01,
      toExpectedOutCalculator: true,
      convertInput: (inputs: number[]) =>
        inputs.map((input) => BigInt(input * 100)),
      convertOutput: (outputs: string[]) =>
        outputs.map((output) => Number(output) / 100),
    },
  ] as PriceCheckerArgument[],
} as const;

export const priceCheckerAddressesMapping = {
  [PRICE_CHECKERS.FIXED_MIN_OUT]: {
    [goerli.id]: "0xEB2bD2818F7CF1D92D81810b0d45852bE48E1502",
  },
  [PRICE_CHECKERS.UNI_V2]: {
    [goerli.id]: "0x5d74aFFFd2a0250ABA74D6703Bd8e140534b3F36",
  },
  [PRICE_CHECKERS.BALANCER]: {
    [goerli.id]: "0xA6a7dA94C0D28159B84BC754733781e67E33531D",
  },
  [PRICE_CHECKERS.SUSHI_SWAP]: {
    [goerli.id]: "0x5A5633909060c75e5B7cB4952eFad918c711F587",
  },
  [PRICE_CHECKERS.CHAINLINK]: {
    [goerli.id]: "0x81909582e1Ab8a0f8f98C948537528E29a98f116",
  },
  [PRICE_CHECKERS.UNI_V3]: {
    [goerli.id]: "0xb560a403F8450164b8B745EccA41D8cED93C50a1",
  },
} as const;

export const priceCheckerHasExpectedOutCalculatorMapping = {
  [PRICE_CHECKERS.FIXED_MIN_OUT]: false,
  [PRICE_CHECKERS.UNI_V2]: true,
  [PRICE_CHECKERS.BALANCER]: true,
  [PRICE_CHECKERS.SUSHI_SWAP]: true,
  [PRICE_CHECKERS.CHAINLINK]: true,
  [PRICE_CHECKERS.UNI_V3]: true,
} as const;
