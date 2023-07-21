import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import * as Separator from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";
import { ReactElement, useState } from "react";

import { Select, SelectItem } from "#/components/Select";
import Sidebar from "#/components/Sidebar";
import { Spinner } from "#/components/Spinner";
import { Tabs } from "#/components/Tabs";
import { Label } from "#/components/ui/label";
import {
  POOL_TYPES,
  PoolType,
  useStableSwap,
} from "#/contexts/PoolSimulatorContext";

// import CustomDataForm from "./CustomDataForm"; BAL-499
// import InitialDataForm from "./InitialDataForm"; BAL-499
import { PoolParamsForm } from "./PoolParamsForm";
import { SearchPoolFormDialog } from "./SearchPoolFormDialog";

const POOL_TYPES_MAPPER = {
  MetaStable: "Meta Stable",
  ECLP: "Gyro E-CLP",
};

function AnalysisMenu() {
  return (
    <div>
      <Tabs defaultValue="customData">
        <Tabs.ItemTriggerWrapper>
          <Tabs.ItemTrigger tabName="initialData" color="blue7">
            <span>Initial</span>
          </Tabs.ItemTrigger>
          <Tabs.ItemTrigger tabName="customData" color="amber9">
            <span>Custom</span>
          </Tabs.ItemTrigger>
        </Tabs.ItemTriggerWrapper>
        <Tabs.ItemContent tabName="initialData">
          {/* <SearchPoolFormWithDataForm>
            <InitialDataForm />
          </SearchPoolFormWithDataForm> */}
          {/* BAL-499 */}
        </Tabs.ItemContent>
        <Tabs.ItemContent tabName="customData">
          <Sidebar.Header name="Custom parameters" />
          {/* <Sidebar.Content>
            <CustomDataForm />
          </Sidebar.Content> */}
          {/* BAL-499 */}
        </Tabs.ItemContent>
      </Tabs>
    </div>
  );
}

function IndexMenu() {
  const [poolType, setPoolType] = useState<PoolType>("MetaStable");
  const onChange = (value: PoolType) => {
    setPoolType(value);
  };

  return (
    <SearchPoolFormWithDataForm>
      <div className="flex flex-col gap-4 mt-4">
        <div className="flex flex-col">
          <Label className="mb-2 block text-sm text-slate12">Pool type</Label>
          <Select onValueChange={onChange} defaultValue="MetaStable">
            {POOL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {POOL_TYPES_MAPPER[type]}
              </SelectItem>
            ))}
          </Select>
        </div>
        <PoolParamsForm poolType={poolType} />
      </div>
    </SearchPoolFormWithDataForm>
  );
}

function SearchPoolFormWithDataForm({ children }: { children: ReactElement }) {
  return (
    <div>
      <SearchPoolFormDialog>
        <div className="bg-blue9 p-2 rounded-[4px]">
          <span className="flex cursor-pointer items-center space-x-2 text-sm font-normal text-slate12">
            <MagnifyingGlassIcon width="20" height="20" strokeWidth={1} />
            <span className="font-medium">Import pool parameters</span>
          </span>
        </div>
      </SearchPoolFormDialog>
      <Separator.Root className="my-5 bg-blue6 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px" />
      <Sidebar.Header name="Initial parameters" />
      <Sidebar.Content>{children}</Sidebar.Content>
    </div>
  );
}

export default function Menu() {
  const pathname = usePathname();
  const { customData, initialData } = useStableSwap();
  if (pathname.includes("/analysis")) {
    if (
      !initialData ||
      !initialData.poolParams ||
      !initialData.tokens ||
      !customData ||
      !customData.poolParams ||
      !customData.tokens
    ) {
      return <Spinner />;
    }
    return <AnalysisMenu />;
  }
  return <IndexMenu />;
}
