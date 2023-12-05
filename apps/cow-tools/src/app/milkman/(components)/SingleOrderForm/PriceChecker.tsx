// import { Address } from "@bleu-fi/utils";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon, TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useState } from "react";
import { FieldValues, useForm, UseFormReturn } from "react-hook-form";

import { TransactionStatus } from "#/app/milkman/utils/type";
import Button from "#/components/Button";
import { Input } from "#/components/Input";
import { Select, SelectItem } from "#/components/Select";
import Table from "#/components/Table";
import { Form, FormMessage } from "#/components/ui/form";
import { Label } from "#/components/ui/label";
import {
  deployedPriceCheckersByChain,
  priceCheckerAddressesMapping,
  priceCheckersArgumentsMapping,
} from "#/lib/priceCheckersMappings";
import { generatePriceCheckerSchema } from "#/lib/schema";
import { PRICE_CHECKERS, PriceCheckerArgument } from "#/lib/types";
import { ChainId, publicClientsFromIds } from "#/utils/chainsPublicClients";

import { FormFooter } from "./Footer";

export function FormSelectPriceChecker({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: FieldValues) => void;
  defaultValues?: FieldValues;
}) {
  const [selectedPriceChecker, setSelectedPriceChecker] =
    useState<PRICE_CHECKERS>(defaultValues?.priceChecker);

  const { safe } = useSafeAppsSDK();

  const chainId = safe.chainId as ChainId;

  const publicClient = publicClientsFromIds[chainId];

  const schema =
    selectedPriceChecker &&
    generatePriceCheckerSchema({
      priceChecker: selectedPriceChecker,
      expectedArgs: priceCheckersArgumentsMapping[selectedPriceChecker],
    })({
      tokenSellAddress: defaultValues?.tokenSell.address,
      tokenBuyAddress: defaultValues?.tokenBuy.address,
      tokenBuyDecimals: defaultValues?.tokenBuy.decimals,
      publicClient,
    });

  const form = useForm(
    selectedPriceChecker && {
      resolver: zodResolver(schema),
      defaultValues,
    },
  );

  const {
    register,
    clearErrors,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  useEffect(() => {
    clearErrors();
    register("priceChecker");
    register("priceCheckerAddress");
    if (!selectedPriceChecker) {
      return;
    }
    setValue("priceChecker", selectedPriceChecker);
    setValue(
      "priceCheckerAddress",
      priceCheckerAddressesMapping[chainId][selectedPriceChecker],
    );
  }, [selectedPriceChecker]);

  return (
    <Form {...form} onSubmit={onSubmit} className="flex flex-col gap-y-6 p-9">
      <div className="mb-2">
        <Label>Price checker</Label>
        <Select
          onValueChange={(priceChecker) => {
            setSelectedPriceChecker(priceChecker as PRICE_CHECKERS);
          }}
          className="w-full mt-2"
          defaultValue={defaultValues?.priceChecker}
        >
          {deployedPriceCheckersByChain[chainId].map((priceChecker) => (
            <SelectItem value={priceChecker} key={priceChecker}>
              {priceChecker}
            </SelectItem>
          ))}
        </Select>
        {errors.priceChecker && (
          <FormMessage className="h-6 text-sm text-tomato10 w-full">
            <span>{errors.priceChecker.message as string}</span>
          </FormMessage>
        )}
      </div>
      {selectedPriceChecker && (
        <PriceCheckerInputs
          form={form}
          priceChecker={selectedPriceChecker}
          defaultValues={defaultValues}
          tokenBuyDecimals={defaultValues?.tokenBuy.decimals}
        />
      )}
      <FormFooter
        transactionStatus={TransactionStatus.ORDER_STRATEGY}
        disabled={!selectedPriceChecker}
        isLoading={isSubmitting}
      />
    </Form>
  );
}

function PriceCheckerInputs({
  priceChecker,
  form,
  defaultValues,
  tokenBuyDecimals,
}: {
  priceChecker: PRICE_CHECKERS;
  form: UseFormReturn;
  defaultValues?: FieldValues;
  tokenBuyDecimals: number;
}) {
  const priceCheckerAguments = priceCheckersArgumentsMapping[priceChecker];
  const nonArrayArguments = priceCheckerAguments.filter(
    (arg) => !arg.type.includes("[]"),
  );

  const arrayArguments = priceCheckerAguments.filter((arg) =>
    arg.type.includes("[]"),
  );

  const { register } = form;

  return (
    <div className="flex flex-col w-full gap-y-2">
      {nonArrayArguments.map((arg) => (
        <Input
          type={arg.inputType}
          label={arg.label}
          key={arg.name}
          defaultValue={defaultValues?.[arg.name]}
          step={arg.step || 10 ** -tokenBuyDecimals}
          {...register(arg.name)}
        />
      ))}
      {arrayArguments.length > 0 && (
        <ArrayPriceCheckerInput
          arrayArguments={arrayArguments}
          form={form}
          defaultValues={defaultValues}
        />
      )}
    </div>
  );
}

function ArrayPriceCheckerInput({
  arrayArguments,
  form,
  defaultValues,
}: {
  arrayArguments: PriceCheckerArgument[];
  form: UseFormReturn;
  defaultValues?: FieldValues;
}) {
  const {
    register,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const [lengthOfArguments, setLengthOfArguments] = useState(1);
  const formData = watch();

  return (
    <div className="flex flex-col w-full gap-y-2 mt-2">
      <Table color="blue" shade="darkWithBorder">
        <Table.HeaderRow>
          {arrayArguments.map((arg) => (
            <Table.HeaderCell key={arg.name}>{arg.label}</Table.HeaderCell>
          ))}
          <Table.HeaderCell>
            <Button
              type="button"
              className="px-5 py-2"
              onClick={() => {
                setLengthOfArguments(lengthOfArguments + 1);
              }}
            >
              <PlusIcon className="w-5 h-5 items-end" />
            </Button>
          </Table.HeaderCell>
        </Table.HeaderRow>
        <Table.Body>
          {[...Array(lengthOfArguments).keys()].map((index) => {
            return (
              <Table.BodyRow key={index}>
                {arrayArguments.map((arg) => {
                  const argName = `${arg.name}.${index}`;
                  return (
                    <Table.BodyCell classNames="align-top" key={arg.name}>
                      {arg.type.includes("bool") ? (
                        <div className="flex items-center justify-center gap-x-2 mt-2">
                          <input
                            className="h-5 w-5 mt-2"
                            type="checkbox"
                            key={argName}
                            defaultChecked={defaultValues?.[argName]}
                            {...register(argName)}
                          />
                        </div>
                      ) : (
                        <Input
                          type={arg.inputType}
                          key={argName}
                          defaultValue={defaultValues?.[argName]}
                          step={arg.step}
                          {...register(argName)}
                        />
                      )}
                      {errors[arg.name] && (
                        <FormMessage className="mt-1 h-6 text-sm text-tomato10">
                          <span>
                            {/* @ts-ignore */}
                            {errors[arg.name][index]?.message as string}
                          </span>
                        </FormMessage>
                      )}
                    </Table.BodyCell>
                  );
                })}
                <Table.BodyCell>
                  <div className="flex items-center justify-center gap-x-2">
                    <button
                      className="justify-self-center text-tomato9 hover:text-tomato10"
                      type="button"
                      onClick={() => {
                        arrayArguments.forEach((arg) => {
                          setValue(arg.name, [
                            ...formData[arg.name].slice(0, index),
                            ...formData[arg.name].slice(index + 1),
                          ]);
                          setLengthOfArguments(lengthOfArguments - 1);
                        });
                      }}
                    >
                      <TrashIcon className="w-7 h-7" />
                    </button>
                  </div>
                </Table.BodyCell>
              </Table.BodyRow>
            );
          })}
        </Table.Body>
      </Table>
      {errors[arrayArguments[0].name] && (
        <FormMessage className="h-6 text-sm text-tomato10 w-full">
          <span>{errors[arrayArguments[0].name]?.message as string}</span>
        </FormMessage>
      )}
    </div>
  );
}