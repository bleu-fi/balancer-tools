import { MagnifyingGlassIcon } from "@radix-ui/react-icons";
import * as Separator from "@radix-ui/react-separator";
import { usePathname } from "next/navigation";
import { ReactElement, useState } from "react";

import { Dialog } from "#/components/Dialog";
import { Select, SelectItem } from "#/components/Select";
import Sidebar from "#/components/Sidebar";
import { Spinner } from "#/components/Spinner";
import { Tabs } from "#/components/Tabs";
import { Label } from "#/components/ui/label";
import {
  CustomFormContextProvider,
  InitialFormContextProvider,
  usePoolFormContext,
} from "#/contexts/FormContext";
import {
  DataType,
  POOL_TYPES,
  PoolType,
  usePoolSimulator,
} from "#/contexts/PoolSimulatorContext";

import AnalysisPoolParamsForm from "./AnalysisPoolParamsForm";
import { PoolParamsForm } from "./PoolParamsForm";
import { SearchPoolFormDialog } from "./SearchPoolFormDialog";
import { SelectPoolType } from "./SelectPoolType";

const POOL_TYPES_MAPPER = {
  MetaStable: "Meta Stable",
  GyroE: "Gyro E-CLP",
};

function IndexMenu() {
  const { tabValue } = usePoolSimulator();
  const clickInitialDataTab = new CustomEvent("clickInitialDataTab");
  const clickCustomDataTab = new CustomEvent("clickCustomDataTab");

  return (
    <div>
      <Tabs value={tabValue} defaultValue={DataType.initialData}>
        <Tabs.ItemTriggerWrapper>
          <Tabs.ItemTrigger
            tabName={DataType.initialData}
            color="blue7"
            onClick={() => {
              document.dispatchEvent(clickInitialDataTab);
            }}
          >
            <span>Initial</span>
          </Tabs.ItemTrigger>
          <Tabs.ItemTrigger
            tabName={DataType.customData}
            color="amber9"
            onClick={() => {
              document.dispatchEvent(clickCustomDataTab);
            }}
          >
            <span>Custom</span>
          </Tabs.ItemTrigger>
        </Tabs.ItemTriggerWrapper>
        <Tabs.ItemContent tabName={DataType.initialData}>
          <InitialFormContextProvider>
            <SearchPoolFormWithDataForm>
              <div className="flex flex-col mt-4">
                <FormWithPoolType />
              </div>
            </SearchPoolFormWithDataForm>
          </InitialFormContextProvider>
        </Tabs.ItemContent>
        <Tabs.ItemContent tabName={DataType.customData}>
          <CustomFormContextProvider>
            <SearchPoolFormWithDataForm>
              <div className="flex flex-col mt-4">
                <FormWithPoolType />
              </div>
            </SearchPoolFormWithDataForm>
          </CustomFormContextProvider>
        </Tabs.ItemContent>
      </Tabs>
    </div>
  );
}

function FormWithPoolType() {
  const [open, setOpen] = useState(false);
  const {
    data: { poolType },
  } = usePoolFormContext();
  const [selectedType, setSelectedType] = useState<PoolType>(poolType);

  function onChange(valeu: PoolType) {
    setSelectedType(valeu);
    setOpen(true);
  }

  function onClose() {
    if (selectedType !== poolType) {
      setSelectedType(poolType);
    }
  }

  return (
    <div className="flex flex-col">
      <Dialog
        content={<SelectPoolType selectedType={selectedType} />}
        isOpen={open}
        setIsOpen={setOpen}
        onClose={onClose}
      >
        <div className="flex flex-col mb-4">
          <Label className="mb-2 block text-sm text-slate12">Pool type</Label>
          <Select onValueChange={onChange} value={selectedType}>
            {POOL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {POOL_TYPES_MAPPER[type]}
              </SelectItem>
            ))}
          </Select>
        </div>
      </Dialog>
      <PoolParamsForm />
    </div>
  );
}

function SearchPoolFormWithDataForm({ children }: { children: ReactElement }) {
  const {
    data: { poolType },
    isCustomData,
  } = usePoolFormContext();
  return (
    <div>
      <SearchPoolFormDialog poolTypeFilter={poolType}>
        <div className="bg-blue9 p-2 rounded-[4px]">
          <span className="flex cursor-pointer items-center space-x-2 text-sm font-normal text-slate12">
            <MagnifyingGlassIcon width="20" height="20" strokeWidth={1} />
            <span className="font-medium">Import pool parameters</span>
          </span>
        </div>
      </SearchPoolFormDialog>
      <Separator.Root className="my-5 bg-blue6 data-[orientation=horizontal]:h-px data-[orientation=vertical]:h-full data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px" />
      <Sidebar.Header
        name={isCustomData ? "Custom parameters" : "Initial parameters"}
      />
      <Sidebar.Content>{children}</Sidebar.Content>
    </div>
  );
}

export default function Menu() {
  const pathname = usePathname();
  const { customData, initialData } = usePoolSimulator();
  if (pathname.includes("/analysis")) {
    if (
      !initialData ||
      !initialData.poolParams ||
      !customData ||
      !customData.poolParams
    ) {
      return <Spinner />;
    }
    return <AnalysisPoolParamsForm />;
  }
  return <IndexMenu />;
}
