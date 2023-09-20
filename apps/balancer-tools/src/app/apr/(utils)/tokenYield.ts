import { Address, networkFor, networkIdFor } from "@bleu-balancer-tools/utils";
import { zeroAddress } from "viem";

import { withCache } from "#/lib/cache";
import { blocks, pools } from "#/lib/gql/server";

import { ChainName, publicClients } from "./chainsPublicClients";
import { manualPoolsRateProvider } from "./poolsRateProvider";
import { vunerabilityAffecteRateProviders } from "./vunerabilityAffectedPool";

const rateProviderAbi = [
  {
    inputs: [],
    name: "getRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];

const SECONDS_IN_DAY = 86400;
const DAYS_IN_YEAR = 365;
const SECONDS_IN_YEAR = DAYS_IN_YEAR * SECONDS_IN_DAY;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getPoolTokensAprForDate = withCache(
  async function getPoolTokensAprForDateFn(
    chain: string,
    poolId: Address,
    date: number,
  ) {
    const rateProviders = await getPoolTokensRateProviders(chain, poolId);

    const chainName = networkFor(chain) as ChainName;

    return await Promise.all(
      rateProviders
        .filter(({ address }) => address !== zeroAddress)
        .map(
          async ({
            address: rateProviderAddress,
            token: { symbol, address: tokenAddress },
          }) => ({
            address: tokenAddress,
            symbol,
            yield: await getAPRFromRateProviderInterval(
              rateProviderAddress,
              date - SECONDS_IN_DAY,
              date,
              chainName,
            ),
          }),
        ),
    );
  },
);

const getAPRFromRateProviderInterval = withCache(
  async function getAPRFromRateProviderIntervalFn(
    rateProviderAddress: Address,
    timeStart: number,
    timeEnd: number,
    chainName: ChainName,
  ) {
    if (
      timeEnd >= 1692662400 && // pool vunerability was found on August 22
      vunerabilityAffecteRateProviders.some(
        ({ address }) => address === rateProviderAddress,
      )
    ) {
      return 0;
    }

    let apr = -1;

    try {
      const { endRate, startRate } = await getIntervalRates(
        rateProviderAddress,
        timeStart,
        timeEnd,
        chainName,
      );

      apr = getAPRFromRate(startRate, endRate, timeStart, timeEnd);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(
        `Error fetching rate for ${rateProviderAddress} between ${timeStart} and ${timeEnd} chain ${chainName}`,
      );
    } finally {
      if (apr < 0) {
        // eslint-disable-next-line no-console
        console.error(
          `Negative APR for ${rateProviderAddress} between ${timeStart} and ${timeEnd}`,
        );
      }
    }
    return apr;
  },
);

function getAPRFromRate(
  rateStart: number,
  rateEnd: number,
  timeStart: number,
  timeEnd: number,
) {
  const duration = timeEnd - timeStart;
  const rateOfReturn = (rateEnd - rateStart) / rateStart;
  const annualScalingFactor = SECONDS_IN_YEAR / duration;

  return rateOfReturn * annualScalingFactor * 100;
}

const getPoolTokensRateProviders = withCache(
  async function getPoolTokensRateProvidersFn(
    chain: string,
    poolId: Address,
  ): Promise<
    { address: Address; token: { address: Address; symbol: string } }[]
  > {
    const data = await pools.gql(String(chain)).PoolRateProviders({ poolId });

    if (!data.pool?.priceRateProviders?.length) {
      const poolRateProvider = manualPoolsRateProvider.find(
        ({ poolAddress }) => poolAddress.toLowerCase() === poolId.toLowerCase(),
      );

      if (poolRateProvider === undefined) {
        // eslint-disable-next-line no-console
        console.error(
          `Pool ${poolId} from ${networkFor(
            chain,
          )} not found in manualPoolsRateProvider`,
        );
        return [];
      }

      return [
        {
          address: poolRateProvider.address,
          token: {
            address: poolRateProvider.token.address,
            symbol: poolRateProvider.token.symbol,
          },
        },
      ];
    }

    return data.pool?.priceRateProviders;
  },
);

const getIntervalRates = withCache(async function getIntervalRatesFn(
  rateProviderAddress: Address,
  timeStart: number,
  timeEnd: number,
  chainName: ChainName,
) {
  const [dataStart, dataEnd] = await Promise.all([
    blocks.gql(String(networkIdFor(chainName))).Blocks({
      timestamp_gte: timeStart,
      timestamp_lt: timeEnd,
    }),
    blocks.gql(String(networkIdFor(chainName))).Blocks({
      timestamp_gte: timeEnd,
      timestamp_lt: timeEnd + SECONDS_IN_DAY,
    }),
  ]);

  const blockStart = dataStart.blocks[0]?.number;
  const blockEnd = dataEnd.blocks[0]?.number;

  if (blockStart === undefined || blockEnd === undefined) {
    // eslint-disable-next-line no-console
    console.error(
      `No blocks found between ${timeStart} and ${timeEnd} on ${chainName}`,
    );
    throw new Error("No blocks found");
  }

  const [endRate, startRate] = await Promise.all([
    getRateAtBlock(chainName, rateProviderAddress, blockEnd),
    getRateAtBlock(chainName, rateProviderAddress, blockStart),
  ]);

  return { endRate: Number(endRate), startRate: Number(startRate) };
});

const getRateAtBlock = withCache(async function getRateAtBlockFn(
  chainName: ChainName,
  rateProviderAddress: Address,
  blockNumber?: number,
) {
  const args = {
    address: rateProviderAddress,
    abi: rateProviderAbi,
    functionName: "getRate",
    blockNumber: blockNumber ? BigInt(blockNumber) : undefined,
  } as const;

  let rate;
  try {
    rate = await publicClients[chainName].readContract(args);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(
      `Error fetching rate for ${rateProviderAddress} at block ${blockNumber} on ${chainName}`,
    );
    rate = -1;
  }

  return Number(rate);
});
