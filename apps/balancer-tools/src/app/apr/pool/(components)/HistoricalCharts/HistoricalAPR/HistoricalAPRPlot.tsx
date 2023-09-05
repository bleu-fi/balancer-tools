"use client";

import Plot from "#/components/Plot";

export default function HistoricalAPRPlot({ data }: { data: Plotly.Data[] }) {
  return (
    <div className="flex justify-between bg-blue3 rounded p-4 cursor-pointer z-50">
      <Plot
        title={`Historical APR`}
        data={data}
        layout={{
          autosize: true,
          xaxis: {
            fixedrange: true,
            dtick: 1,
            title: "Round Number",
          },
          yaxis: {
            fixedrange: true,
            title: "APR %",
          },
        }}
      />
    </div>
  );
}