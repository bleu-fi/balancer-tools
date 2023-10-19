import { redirect } from "next/navigation";
import { Suspense } from "react";

import ChartSkelton from "./(components)/(skeleton)/ChartSkelton";
import KpisSkeleton from "./(components)/(skeleton)/KpisSkeleton";
import TableSkeleton from "./(components)/(skeleton)/TableSkeleton";
import Breadcrumb from "./(components)/Breadcrumb";
import HomeOverviewCards from "./(components)/HomeOverviewCards";
import PoolTableWrapper from "./(components)/PoolTableWrapper";
import TopPoolsChartWrapper from "./(components)/TopPoolsChartWrapper";
import {
  generateApiUrlWithParams,
  generatePoolPageLink,
} from "./(utils)/getFilteredApiUrl";
import { SECONDS_IN_DAY } from "./api/(utils)/date";
import { QueryParamsPagesSchema } from "./api/(utils)/validate";

export interface SearchParams {
  minTvl?: string;
  maxTvl?: string;
  minApr?: string;
  maxApr?: string;
  tokens?: string;
  type?: string;
  network?: string;
}

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  const parsedParams = QueryParamsPagesSchema.safeParse(searchParams);
  if (!parsedParams.success) {
    const currentDateFormated = new Date();
    const threeDaysAgoDateFormated = new Date(
      new Date().getTime() - 3 * SECONDS_IN_DAY * 1000,
    );
    return redirect(
      generatePoolPageLink(
        threeDaysAgoDateFormated,
        currentDateFormated,
        searchParams,
      ),
    );
  }
  const { startAt: startAtDate, endAt: endAtDate } = parsedParams.data;
  if (!startAtDate || !endAtDate) {
    return redirect("/apr/");
  }

  const url = generateApiUrlWithParams(startAtDate, endAtDate, searchParams);

  return (
    <div className="flex flex-1 flex-col gap-y-3">
      <Breadcrumb />
      <Suspense fallback={<KpisSkeleton />}>
        <HomeOverviewCards startAt={startAtDate} endAt={endAtDate} />
      </Suspense>

      <Suspense fallback={<ChartSkelton />}>
        <TopPoolsChartWrapper
          startAt={startAtDate}
          endAt={endAtDate}
          url={url}
        />
      </Suspense>
      <Suspense fallback={<TableSkeleton colNumbers={10} />}>
        <PoolTableWrapper startAt={startAtDate} endAt={endAtDate} url={url} />
      </Suspense>
    </div>
  );
}
