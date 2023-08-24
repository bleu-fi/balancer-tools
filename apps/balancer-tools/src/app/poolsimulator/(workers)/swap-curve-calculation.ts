import { AMM } from "@bleu-balancer-tools/math-poolsimulator/src";
import { PoolPairData } from "@bleu-balancer-tools/math-poolsimulator/src/types";

import { AnalysisData } from "#/contexts/PoolSimulatorContext";
import { trimTrailingValues } from "#/lib/utils";

import { TokensData } from "../(types)";
import {
  calculateCurvePoints,
  convertAnalysisDataToAMM,
  findTokenBySymbol,
} from "../(utils)";

export interface SwapCurveWorkerInputData {
  analysisToken: TokensData;
  currentTabToken: TokensData;
  data: AnalysisData;
  type: "initial" | "custom";
}

export interface SwapCurveWorkerOutputData {
  result?: {
    analysisTokenIn: number[];
    analysisTokenOut: number[];
    tabTokenOut: number[];
    tabTokenIn: number[];
  };
  error?: Error;
  type: "initial" | "custom";
}

self.addEventListener(
  "message",
  async (event: MessageEvent<SwapCurveWorkerInputData>) => {
    const { analysisToken, currentTabToken, data, type } = event.data;

    if (!data) return;

    const amm = await convertAnalysisDataToAMM(data);

    if (!amm) return;

    const calculateTokenAmounts = (
      tokenIn: TokensData,
      tokenOut: TokensData,
      amm: AMM<PoolPairData>,
    ) => {
      const rawAmountsAnalysisTokenIn = calculateCurvePoints({
        balance: tokenOut.balance,
      });

      const rawAmountsTabTokenIn = calculateCurvePoints({
        balance: tokenIn.balance,
      });

      const rawAmountsTabTokenOut = rawAmountsAnalysisTokenIn.map(
        (amount) =>
          amm.exactTokenInForTokenOut(amount, tokenIn.symbol, tokenOut.symbol) *
          -1,
      );

      const rawAmountsAnalysisTokenOut = rawAmountsTabTokenIn.map(
        (amount) =>
          amm.exactTokenInForTokenOut(amount, tokenOut.symbol, tokenIn.symbol) *
          -1,
      );

      const { trimmedIn: tabTokenIn, trimmedOut: analysisTokenOut } =
        trimTrailingValues(rawAmountsTabTokenIn, rawAmountsAnalysisTokenOut, 0);

      const { trimmedIn: analysisTokenIn, trimmedOut: tabTokenOut } =
        trimTrailingValues(rawAmountsAnalysisTokenIn, rawAmountsTabTokenOut, 0);

      return {
        analysisTokenIn: analysisTokenIn as number[],
        analysisTokenOut: analysisTokenOut as number[],
        tabTokenOut: tabTokenOut as number[],
        tabTokenIn: tabTokenIn as number[],
      };
    };

    const calcResult = calculateTokenAmounts(
      findTokenBySymbol(data?.tokens, analysisToken.symbol) as TokensData,
      findTokenBySymbol(data?.tokens, currentTabToken.symbol) as TokensData,
      amm,
    );

    const result: SwapCurveWorkerOutputData = {
      result: calcResult,
      type,
    };
    self.postMessage(result);
  },
);
