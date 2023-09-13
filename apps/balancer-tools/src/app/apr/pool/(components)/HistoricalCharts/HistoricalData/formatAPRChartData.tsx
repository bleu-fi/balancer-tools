import { blueDarkA, greenDarkA, violetDarkA, whiteA } from "@radix-ui/colors";
import { PlotType } from "plotly.js";

import { PoolStatsResults } from "#/app/apr/api/route";

import { generateAndTrimAprCords } from "..";

export default function formatAPRChartData(
  apiResult: PoolStatsResults,
  yaxis: string,
): Plotly.Data[] {
  const HOVERTEMPLATE = "%{y:.2f}%";
  const trimmedVebalAprData = generateAndTrimAprCords(
    apiResult.perRound,
    (result) => result.apr.breakdown.veBAL,
    0,
  );

  const trimmedFeeAprData = generateAndTrimAprCords(
    apiResult.perRound,
    (result) => result.apr.breakdown.swapFee,
    0,
  );

  const trimmedTotalAprData = generateAndTrimAprCords(
    apiResult.perRound,
    (result) => result.apr.total,
    0,
  );
  const vebalAprPerRoundData = {
    name: "veBAL APR %",
    yaxis: yaxis,
    hovertemplate: HOVERTEMPLATE,
    x: trimmedVebalAprData.x,
    y: trimmedVebalAprData.y,
    line: { shape: "spline", color: blueDarkA.blueA9 } as const,
    type: "scatter" as PlotType,
  };

  const feeAprPerRoundData = {
    name: "Fee APR %",
    yaxis: yaxis,
    hovertemplate: HOVERTEMPLATE,
    x: trimmedFeeAprData.x,
    y: trimmedFeeAprData.y,
    line: { shape: "spline", color: greenDarkA.greenA9 } as const,
    type: "scatter" as PlotType,
  };

  const totalAprPerRoundData = {
    name: "Total APR %",
    yaxis: yaxis,
    hovertemplate: HOVERTEMPLATE,
    x: trimmedTotalAprData.x,
    y: trimmedTotalAprData.y,
    line: { shape: "spline", color: whiteA.whiteA9 } as const,
    type: "scatter" as PlotType,
  };

  const aprTokensData =
    apiResult.perRound[0].apr.breakdown.tokens.breakdown.map(
      ({ symbol }, idx) => {
        const trimmedTokenAprData = generateAndTrimAprCords(
          apiResult.perRound,
          (result) => result.apr.breakdown.tokens.breakdown[idx].yield,
          0,
        );
        return {
          name: `${symbol} APR %`,
          yaxis: yaxis,
          showlegend: false,
          hovertemplate: HOVERTEMPLATE,
          x: trimmedTokenAprData.x,
          y: trimmedTokenAprData.y,
          line: { shape: "spline", color: "rgba(0,0,0,0);" } as const,
          type: "scatter" as PlotType,
        };
      },
    );

  const trimmedTokenTotalAprData = generateAndTrimAprCords(
    apiResult.perRound,
    (result) => result.apr.breakdown.tokens.total,
    0,
  );
  const aprTokensTotalData = {
    name: `Tokens Yield APR %`,
    yaxis: yaxis,
    hovertemplate: HOVERTEMPLATE,
    x: trimmedTokenTotalAprData.x,
    y: trimmedTokenTotalAprData.y,
    line: { shape: "spline", color: violetDarkA.violetA9 } as const,
    type: "scatter" as PlotType,
  };

  return [
    totalAprPerRoundData,
    vebalAprPerRoundData,
    feeAprPerRoundData,
    aprTokensTotalData,
    ...aprTokensData,
  ];
}