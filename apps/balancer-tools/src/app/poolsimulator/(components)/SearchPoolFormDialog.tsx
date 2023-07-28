"use client";

import { PropsWithChildren } from "react";

import { Dialog } from "#/components/Dialog";
import { SearchPoolForm } from "#/components/SearchPoolForm";
import { PoolType, usePoolSimulator } from "#/contexts/PoolSimulatorContext";

import { PoolTypeEnum } from "../(types)";

const poolTypes = {
  [PoolTypeEnum.MetaStable]: ["Stable", "MetaStable", "ComposableStable"],
  [PoolTypeEnum.GyroE]: ["GyroE"],
};
export function SearchPoolFormDialog({
  children,
  poolTypeFilter,
}: PropsWithChildren<{ poolTypeFilter: PoolType }>) {
  const { handleImportPoolParametersById } = usePoolSimulator();

  return (
    <Dialog
      title="Import pool parameters"
      content={
        <SearchPoolForm
          poolTypeFilter={poolTypes[poolTypeFilter]}
          onSubmit={handleImportPoolParametersById}
          showPools
        />
      }
    >
      {children}
    </Dialog>
  );
}
