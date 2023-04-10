"use client";

import { networkIdEnumMap } from "@balancer-pool-metadata/shared";
import { useRouter } from "next/navigation";
import React from "react";
import { Controller, useForm } from "react-hook-form";

import Button from "#/components/Button";
import { Input } from "#/components/Input";
import { Select, SelectItem } from "#/components/Select";
import { pools } from "#/lib/gql";
import { useNetwork } from "#/wagmi";

export interface PoolMetadataAttribute {
  poolId: string;
  network: string;
}

const inputTypenames = [
  { value: "1", label: "Mainnet" },
  { value: "137", label: "Polygon" },
  { value: "42161", label: "Arbitrum" },
  { value: "5", label: "Goerli" },
];

export default function SearchPoolForm({ close }: { close?: () => void }) {
  const {
    register,
    handleSubmit,
    setError,
    control,
    watch,
    clearErrors,
    resetField,
    formState: { errors },
  } = useForm<PoolMetadataAttribute>();
  const { push } = useRouter();
  const { chain } = useNetwork();

  const poolId = watch("poolId");
  const network = watch("network");

  const { data: poolAddress } = pools.gql(network || "1").usePoolAddress(
    {
      poolId,
    },
    { revalidateIfStale: true }
  );

  const isPool = poolAddress?.pool?.address ? true : false;

  function handleSubmitForm(formData: PoolMetadataAttribute) {
    const networkId = formData.network ?? chain?.id.toString();
    const networkName =
      networkIdEnumMap[networkId as keyof typeof networkIdEnumMap];
    push(`/metadata/${networkName}/pool/${formData.poolId}`);

    close?.();
  }

  React.useEffect(() => {
    if (poolAddress && !poolAddress.pool && poolId) {
      setError(
        "poolId",
        {
          type: "notfound",
          message: "Pool not found. Check the Pool ID and network.",
        },
        { shouldFocus: true }
      );
      return;
    } else {
      clearErrors("poolId");
    }
  }, [poolAddress]);

  React.useLayoutEffect(() => {
    resetField("poolId");
  }, [network]);

  return (
    <form onSubmit={handleSubmit(handleSubmitForm)} className="px-2 pt-2">
      <label className="mb-2 block text-sm text-slate12">Network</label>
      <div className="mb-2">
        <Controller
          control={control}
          name={"network"}
          defaultValue={"1"}
          render={({ field: { onChange, value, ref } }) => (
            <Select onValueChange={onChange} value={value} ref={ref}>
              {inputTypenames.map(({ value, label }) => (
                <SelectItem value={value}>{label}</SelectItem>
              ))}
            </Select>
          )}
        />
      </div>

      <Input
        label="Pool ID"
        placeholder={"e.g 0x4467a48fjdan...0000692"}
        {...register("poolId")}
      />
      <p className="text-sm text-tomato10">{errors.poolId?.message}</p>
      <div className="mt-4 flex items-center justify-end">
        <Button type="submit" disabled={!isPool || poolId === ""}>
          Go
        </Button>
      </div>
    </form>
  );
}
