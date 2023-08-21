import { PoolQuery } from "@bleu-balancer-tools/gql/src/balancer/__generated__/Ethereum";
import { AMM } from "@bleu-balancer-tools/math-poolsimulator/src";
import { ExtendedFx } from "@bleu-balancer-tools/math-poolsimulator/src/fx";
import { ExtendedGyro2 } from "@bleu-balancer-tools/math-poolsimulator/src/gyro2";
import { ExtendedGyro3 } from "@bleu-balancer-tools/math-poolsimulator/src/gyro3";
import { ExtendedGyroEV2 } from "@bleu-balancer-tools/math-poolsimulator/src/gyroE";
import { ExtendedMetaStableMath } from "@bleu-balancer-tools/math-poolsimulator/src/metastable";

import { AnalysisData } from "#/contexts/PoolSimulatorContext";
import { fetchECLPDerivativeParams } from "#/lib/eclp-derivative";

import { PoolTypeEnum, TokensData } from "../(types)";

export async function convertAnalysisDataToAMM(data: AnalysisData) {
  if (!data.poolType || typeof data.poolParams?.swapFee === "undefined") return;

  const tokensData = data.tokens.map((token) => ({
    address: token.symbol, // math use address as key, but we will use symbol because custom token will not have address
    balance: String(token.balance),
    decimals: token.decimal,
    priceRate: data.poolType === PoolTypeEnum.Fx ? "1" : String(token.rate),
    token: {
      latestFXPrice: String(token.rate),
      fxOracleDecimals: 8,
    },
  }));

  switch (data.poolType) {
    case PoolTypeEnum.MetaStable: {
      return new AMM(
        new ExtendedMetaStableMath({
          amp: String(data.poolParams?.ampFactor),
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: tokensData,
          tokensList: data.tokens.map((token) => String(token.symbol)),
        }),
      );
    }
    case PoolTypeEnum.GyroE: {
      const derivedParams = await fetchECLPDerivativeParams(data);
      return new AMM(
        new ExtendedGyroEV2({
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: tokensData,
          tokensList: data.tokens.map((token) => String(token.symbol)),

          gyroEParams: {
            alpha: String(data.poolParams?.alpha),
            beta: String(data.poolParams?.beta),
            lambda: String(data.poolParams?.lambda),
            c: String(data.poolParams?.c),
            s: String(data.poolParams?.s),
          },
          derivedGyroEParams: derivedParams,
          tokenRates: data.tokens.map((token) => String(token.rate)),
        }),
      );
    }
    case PoolTypeEnum.Gyro2: {
      return new AMM(
        new ExtendedGyro2({
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: tokensData,
          tokensList: data.tokens.map((token) => String(token.symbol)),
          sqrtAlpha: String(data.poolParams?.sqrtAlpha),
          sqrtBeta: String(data.poolParams?.sqrtBeta),
        }),
      );
    }
    case PoolTypeEnum.Gyro3: {
      return new AMM(
        new ExtendedGyro3({
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: tokensData,
          tokensList: data.tokens.map((token) => String(token.symbol)),
          root3Alpha: String(data.poolParams?.root3Alpha),
        }),
      );
    }
    case PoolTypeEnum.Fx: {
      return new AMM(
        new ExtendedFx({
          swapFee: String(data.poolParams?.swapFee),
          totalShares: String(
            data.tokens.reduce((acc, token) => acc + token.balance, 0),
          ),
          tokens: tokensData,
          tokensList: data.tokens.map((token) => String(token.symbol)),
          alpha: String(data.poolParams?.alpha),
          beta: String(data.poolParams?.beta),
          lambda: String(data.poolParams?.lambda),
          delta: String(data.poolParams?.delta),
          epsilon: String(data.poolParams?.epsilon),
        }),
      );
    }
    default:
      return;
  }
}

export function convertGqlToAnalysisData(poolData: PoolQuery): AnalysisData {
  const tokensData =
    poolData?.pool?.tokens
      ?.filter((token) => token.address !== poolData?.pool?.address) // filter out BPT
      .map((token) => {
        if (poolData.pool?.poolType === PoolTypeEnum.Fx)
          return {
            symbol: token?.symbol,
            balance: Number(token?.balance),
            rate: Number(token?.token.latestFXPrice),
            decimal: Number(token?.decimals),
            fxOracleDecimals: Number(token?.token.fxOracleDecimals),
          };
        return {
          symbol: token?.symbol,
          balance: Number(token?.balance),
          rate: Number(token?.priceRate),
          decimal: Number(token?.decimals),
        };
      }) || [];
  switch (poolData.pool?.poolType) {
    case PoolTypeEnum.GyroE:
      return {
        poolType: PoolTypeEnum.GyroE,
        poolParams: {
          alpha: Number(poolData?.pool?.alpha),
          beta: Number(poolData?.pool?.beta),
          lambda: Number(poolData?.pool?.lambda),
          c: Number(poolData?.pool?.c),
          s: Number(poolData?.pool?.s),
          swapFee: Number(poolData?.pool?.swapFee),
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.MetaStable:
      return {
        poolType: PoolTypeEnum.MetaStable,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          ampFactor: Number(poolData?.pool?.amp),
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.Gyro2:
      return {
        poolType: PoolTypeEnum.Gyro2,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          sqrtAlpha: Number(poolData?.pool?.sqrtAlpha),
          sqrtBeta: Number(poolData?.pool?.sqrtBeta),
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.Gyro3:
      return {
        poolType: PoolTypeEnum.Gyro3,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          root3Alpha: Number(poolData?.pool?.root3Alpha),
        },
        tokens: tokensData,
      };
    case PoolTypeEnum.Fx:
      return {
        poolType: PoolTypeEnum.Fx,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          alpha: Number(poolData?.pool?.alpha),
          beta: Number(poolData?.pool?.beta),
          lambda: Number(poolData?.pool?.lambda),
          delta: Number(poolData?.pool?.delta),
          epsilon: Number(poolData?.pool?.epsilon),
        },
        tokens: tokensData,
      };
    default:
      return {
        poolType: PoolTypeEnum.MetaStable,
        poolParams: {
          swapFee: Number(poolData?.pool?.swapFee),
          ampFactor: Number(poolData?.pool?.amp),
        },
        tokens:
          poolData?.pool?.tokens
            ?.filter((token) => token.address !== poolData?.pool?.address) // filter out BPT
            .map((token) => ({
              symbol: token?.symbol,
              balance: Number(token?.balance),
              rate: Number(token?.priceRate),
              decimal: Number(token?.decimals),
            })) || [],
      };
  }
}

export function calculateCurvePoints({
  balance,
  startPercentage = 0,
}: {
  balance?: number;
  startPercentage?: number;
}) {
  if (!balance || startPercentage === undefined) return [];
  const numberOfPoints = 100;
  const initialValue = balance * 0.001;
  const stepRatio = Math.pow(balance / initialValue, 1 / (numberOfPoints - 1));

  return [
    startPercentage * balance,
    ...Array.from(
      { length: numberOfPoints + 20 },
      (_, index) => initialValue * stepRatio ** index,
    ),
  ];
}

export function findTokenBySymbol(tokens: TokensData[], symbol?: string) {
  return tokens.find((token) => token.symbol === symbol);
}

export const POOL_TYPES_TO_ADD_LIMIT = [
  PoolTypeEnum.Gyro2,
  PoolTypeEnum.Gyro3,
  PoolTypeEnum.GyroE,
  PoolTypeEnum.Fx,
];
