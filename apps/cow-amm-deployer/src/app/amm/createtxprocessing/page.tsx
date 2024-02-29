"use client";

import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Address } from "viem";

import { Spinner } from "#/components/Spinner";
import { checkIsAmmRunning, fetchLastAmmInfo } from "#/hooks/useRunningAmmInfo";
import { ChainId } from "#/utils/chainsPublicClients";

export default function Page() {
  const {
    safe: { safeAddress, chainId },
  } = useSafeAppsSDK();
  const router = useRouter();

  async function redirectToHomeIfAmmIsRunningAndIndexed() {
    const [isAmmRunning, cowAmmDataIndexed] = await Promise.all([
      checkIsAmmRunning(chainId as ChainId, safeAddress as Address),
      fetchLastAmmInfo({
        chainId: chainId as ChainId,
        safeAddress: safeAddress as Address,
      }),
    ]);
    if (isAmmRunning && cowAmmDataIndexed) {
      router.push("/amm");
    }
  }
  useEffect(() => {
    const intervalId = setInterval(
      redirectToHomeIfAmmIsRunningAndIndexed,
      1000,
    );
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-center rounded-3xl px-12 py-16 md:py-20">
      <div className="text-center text-3xl text-amber9">
        The transaction is being processed
      </div>
      <Spinner />
    </div>
  );
}
