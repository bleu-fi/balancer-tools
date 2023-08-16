import { networkFor } from "@bleu-balancer-tools/utils";
import { ChevronRightIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { Suspense } from "react";

import votingGauges from "#/data/voting-gauges.json";
import { Pool } from "#/lib/balancer/gauges";

import BALPrice from "../../(components)/BALPrice";
import { calculateAPRForPool } from "../../(utils)/calculateRoundAPR";
import { getPoolRelativeWeight } from "../../(utils)/getRelativeWeight";
import { Round } from "../../(utils)/rounds";

export function PoolCard({
  network,
  poolId,
  roundId,
}: {
  poolId: string;
  network?: number;
  roundId?: string;
}) {
  // TODO: Decision. Some pools are not going to have gauges associated to them.
  // Or the gauges are not whitelisted yet.
  // We should not display them. Ideally not even fetch them.
  const pool = new Pool(poolId);

  return (
    <Link href={`/apr/pool/${networkFor(network)}/${pool.id}`}>
      <div className="flex justify-between border border-gray-400 lg:border-gray-400 bg-blue3 rounded p-4 cursor-pointer">
        <div className="">
          <div className="flex justify-between">
            <div className="text-white font-bold text-xl mb-2">{pool.id}</div>
          </div>
          <div className="flex items-center">
            <div className="text-sm">
              <Suspense fallback={"Loading..."}>
                <PoolVotes roundId={roundId} poolId={pool.id} />
              </Suspense>
              <Suspense fallback={"Loading..."}>
                <PoolAPR roundId={roundId} poolId={pool.id} />
              </Suspense>
              <Suspense fallback={"Loading..."}>
                <BALPrice roundId={roundId} />
              </Suspense>
            </div>
          </div>
        </div>
        <div className="text-white flex flex-col justify-center">
          <ChevronRightIcon />
        </div>
      </div>
    </Link>
  );
}

export async function PoolVotes({
  roundId,
  poolId,
}: {
  roundId?: string;
  poolId: string;
}) {
  if (!roundId) return null;

  const votingShare = await getPoolRelativeWeight(
    poolId,
    Round.getRoundByNumber(roundId).endDate.getTime() / 1000,
  );

  return (
    <p className="text-white leading-none mb-1">
      {(votingShare * 100).toFixed(2)}% Voted
    </p>
  );
}

export async function PoolAPR({
  roundId,
  poolId,
}: {
  roundId?: string;
  poolId: string;
}) {
  // TODO BAL-646: aggregate historical pool APR when roundId is not provided
  if (!roundId) return null;

  const { apr } = await calculateAPRForPool({ poolId, roundId });

  return (
    <p className="text-white leading-none mb-1">{apr?.toFixed?.(2)}% APR</p>
  );
}

export default async function PoolsCards({ roundId }: { roundId: string }) {
  return (
    <div className="space-y-6 w-full">
      {votingGauges.slice(0, 10).map((gauge) => (
        <PoolCard
          poolId={gauge.pool.id}
          network={gauge.network}
          roundId={roundId}
          key={gauge.address}
        />
      ))}
    </div>
  );
}
