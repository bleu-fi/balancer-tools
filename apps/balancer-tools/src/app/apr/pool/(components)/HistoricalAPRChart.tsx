import { amberDarkA } from "@radix-ui/colors";
import { PlotType } from "plotly.js";

import { trimTrailingValues } from "#/lib/utils";
import { fetcher } from "#/utils/fetcher";

import { PoolStatsResults } from "../../api/route";
import HistoricalAPRPlot from "./HistoricalAPRPlot";

const getRoundName = (roundId?: string | number) =>
  roundId !== undefined ? `#${roundId}` : "#";

export default async function HistoricalAPRChart({
  roundId,
  poolId,
}: {
  roundId?: string;
  poolId: string;
}) {
  const HOVERTEMPLATE = "%{x}<br />%{y:.2f}% APR<extra></extra>";

  const results: PoolStatsResults = await fetcher(
    `${process.env.NEXT_PUBLIC_SITE_URL}/apr/api/?poolId=${poolId}&sort=roundId`,
  );

  const aprPerRoundCords = Object.entries(results.perRound).reduce(
    (cords, [_, result]) => {
      cords.x.push(getRoundName(result.roundId));
      cords.y.push(result.apr.breakdown.veBAL);
      return cords;
    },
    { x: [], y: [] } as { x: string[]; y: number[] },
  );

  const trimmedVebalAprData = trimTrailingValues(
    aprPerRoundCords.x.reverse(),
    aprPerRoundCords.y.reverse(),
    0,
  );

  const APRPerRoundData = {
    name: "veBAL APR %",
    hovertemplate: HOVERTEMPLATE,
    x: trimmedVebalAprData.trimmedIn,
    y: trimmedVebalAprData.trimmedOut,
    line: { shape: "spline" } as const,
    type: "scatter" as PlotType,
  };

  const chosenRoundMarkerIDX = APRPerRoundData.x.findIndex(
    (item) => item === getRoundName(roundId),
  );
  const chosenRoundData = roundId
    ? {
        hovertemplate: HOVERTEMPLATE,
        x: [APRPerRoundData.x[chosenRoundMarkerIDX]],
        y: [APRPerRoundData.y[chosenRoundMarkerIDX]],
        mode: "markers",
        name: "Selected Round",
        marker: {
          color: amberDarkA.amberA9,
          size: 15,
          line: {
            color: "white",
            width: 2,
          },
        },
      }
    : {};

  return <HistoricalAPRPlot data={[APRPerRoundData, chosenRoundData]} />;
}
