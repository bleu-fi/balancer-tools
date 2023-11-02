"use client";

import { Network } from "@bleu-balancer-tools/utils";
import { useSafeAppsSDK } from "@gnosis.pm/safe-apps-react-sdk";
import { PlusIcon } from "@radix-ui/react-icons";
import { Address, useAccount, useNetwork } from "wagmi";

import { Button } from "#/components";
import { Spinner } from "#/components/Spinner";
import WalletNotConnected from "#/components/WalletNotConnected";
import { getNetwork } from "#/contexts/networks";
import { AllSwapsQuery } from "#/gql/generated";
import { getERC20ApproveRawTx } from "#/transactions/erc20Approve";
import {
  getRequestSwapExactTokensForTokensRawTx,
  MILKMAN_ADDRESS,
} from "#/transactions/milkmanOrder";
import { PRICE_CHECKERS } from "#/transactions/priceCheckers";

import { OrderTable } from "../components/OrdersTable";

export function HomePageWrapper({
  params,
  orders,
}: {
  params: {
    network: Network;
  };
  orders: AllSwapsQuery["swaps"];
}) {
  const { chain } = useNetwork();
  const { isConnected, isReconnecting, isConnecting } = useAccount();

  const { safe, sdk } = useSafeAppsSDK();
  if (!isConnected && !isReconnecting && !isConnecting) {
    return <WalletNotConnected />;
  }

  if (isConnecting || isReconnecting) {
    return <Spinner />;
  }

  const network = getNetwork(chain?.name);

  const handleUniV2Tx = async () => {
    const tokenAddressToSell = "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6"; //WETH
    const tokenAddressToBuy = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984"; //UNI
    const tokenDecimals = 18;
    const bpsDecimals = 2;
    const amount = BigInt(0.004 * 10 ** tokenDecimals);
    const allowedSlippageBps = BigInt(5 * 10 ** bpsDecimals);
    const txs = [
      getERC20ApproveRawTx(tokenAddressToSell, MILKMAN_ADDRESS, amount),
      getRequestSwapExactTokensForTokensRawTx({
        tokenAddressToSell,
        tokenAddressToBuy,
        toAddress: safe.safeAddress as Address,
        amount,
        priceChecker: PRICE_CHECKERS.UNIV2,
        args: [allowedSlippageBps],
      }),
    ];
    await sdk.txs.send({
      txs,
    });
  };

  if (network !== params.network) {
    return (
      <div className="flex h-full w-full flex-col items-center rounded-3xl px-12 py-16 md:py-20">
        <div className="text-center text-3xl text-amber9">
          You are on the wrong network
        </div>
        <div className="text-xl text-white">
          Please change to {params.network}
        </div>
      </div>
    );
  }
  return (
    <div className="flex w-full justify-center">
      <div className="my-10 flex w-9/12 flex-col gap-y-5">
        <div className="flex items-center justify-between gap-x-8">
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl text-slate12">My Milkman transactions</h1>
            {chain?.name}
            <span>{safe.safeAddress}</span>
          </div>
          <div className="flex gap-4">
            <Button
              className="flex items-center gap-1 py-3 px-6"
              title="New order"
            >
              <PlusIcon />
              New order
            </Button>
            <Button
              className="flex items-center gap-1 py-3 px-6"
              title="Send Hardcoded tx"
              onClick={handleUniV2Tx}
            >
              <PlusIcon />
              Send HardCoded Tx
            </Button>
          </div>
        </div>
        <OrderTable orders={orders} />
      </div>
    </div>
  );
}
