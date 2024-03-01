import { ArrowLeftIcon } from "@radix-ui/react-icons";
import { FieldValues } from "react-hook-form";

import { LinkComponent } from "#/components/Link";
import { TRANSACTION_TYPES } from "#/lib/transactionFactory";

import { AmmForm } from "./AmmForm";

function ArrowIcon() {
  return (
    <ArrowLeftIcon
      height={16}
      width={16}
      className="text-amm-brown duration-200 hover:text-amber9"
    />
  );
}

export function FormWrapper({
  transactionType,
  defaultValues,
}: {
  transactionType:
    | TRANSACTION_TYPES.CREATE_COW_AMM
    | TRANSACTION_TYPES.EDIT_COW_AMM;
  defaultValues?: FieldValues;
}) {
  return (
    <>
      <div className="flex h-full items-center justify-center w-full">
        <div className="my-4 flex flex-col rounded-lg border border-3 bg-beige border-seashell text-amm-brown">
          <div className="divide-y divide-brown4 h-full">
            <div className="relative flex h-full w-full justify-center">
              <LinkComponent
                loaderColor="amber"
                href={`/`}
                content={
                  <div className="absolute left-8 flex h-full items-center">
                    <ArrowIcon />
                  </div>
                }
              />
              <div className="flex min-w-[530px] flex-col items-center py-3">
                <div className="text-xl">
                  {transactionType === TRANSACTION_TYPES.CREATE_COW_AMM
                    ? "Create"
                    : "Edit"}{" "}
                  AMM
                </div>
              </div>
            </div>
            <div className="flex flex-col overflow-auto w-full h-full max-h-[550px]">
              <AmmForm
                defaultValues={defaultValues}
                transactionType={transactionType}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
