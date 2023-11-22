"use client";

import {
  Address,
  buildBlockExplorerAddressURL,
  buildBlockExplorerTxUrl,
} from "@bleu-fi/utils";
import { formatNumber } from "@bleu-fi/utils/formatNumber";
import {
  ArrowDownIcon,
  ArrowTopRightIcon,
  ArrowUpIcon,
  InfoCircledIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import cn from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { formatUnits } from "viem";

import { Dialog } from "#/components/Dialog";
import { Spinner } from "#/components/Spinner";
import Table from "#/components/Table";
import {
  ICowOrder,
  useUserMilkmanTransactions,
} from "#/hooks/useUserMilkmanTransactions";
import {
  decodePriceCheckerData,
  getPriceCheckerFromAddressAndChain,
} from "#/lib/decode";
import { AllTransactionFromUserQuery } from "#/lib/gql/generated";
import { priceCheckersArgumentsMapping } from "#/lib/priceCheckersMappings";
import { cowTokenList } from "#/utils/cowTokenList";
import { truncateAddress } from "#/utils/truncate";

import { SwapStatus, TransactionStatus } from "../utils/type";

export function OrderTable() {
  const { transactions, cowOrders, hasToken, loaded } =
    useUserMilkmanTransactions();

  if (!loaded) {
    return <Spinner />;
  }
  return (
    <Table color="blue" shade="darkWithBorder">
      <Table.HeaderRow>
        <Table.HeaderCell>
          <span className="sr-only"></span>
        </Table.HeaderCell>
        <Table.HeaderCell>Sell Token</Table.HeaderCell>
        <Table.HeaderCell>Sell Amount</Table.HeaderCell>
        <Table.HeaderCell>Buy Token</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell>
          <span className="sr-only">Cancel</span>
        </Table.HeaderCell>
      </Table.HeaderRow>
      <Table.Body classNames="max-h-80 overflow-y-auto">
        {transactions?.map((transaction, index) => (
          <TableRowTransaction
            key={transaction.id}
            transaction={transaction}
            cowOrders={cowOrders?.[index]}
            hasToken={hasToken?.[index]}
          />
        ))}
        {transactions?.length === 0 && (
          <Table.BodyRow>
            <Table.BodyCell colSpan={6}>
              <h1 className="text-md text-slate12 m-2 text-center w-full">
                This address didn't made any order on Milkman yet
              </h1>
            </Table.BodyCell>
          </Table.BodyRow>
        )}
      </Table.Body>
    </Table>
  );
}

function TableRowTransaction({
  transaction,
  hasToken,
  cowOrders,
}: {
  transaction: AllTransactionFromUserQuery["users"][0]["transactions"][0];
  hasToken?: boolean[];
  cowOrders?: ICowOrder[][];
}) {
  function getSwapStatus(hasToken?: boolean, cowOrders?: ICowOrder[]) {
    if (!cowOrders || hasToken === undefined) {
      return SwapStatus.MILKMAN_CREATED;
    }

    const anyOrderWasExecuted = cowOrders.some(
      (order) => order.status == "fulfilled"
    );

    if (anyOrderWasExecuted) {
      return SwapStatus.EXECUTED;
    }

    if (!anyOrderWasExecuted && !hasToken) {
      return SwapStatus.CANCELED;
    }

    if (cowOrders.length > 0 && hasToken) {
      return SwapStatus.ORDER_PLACED;
    }

    return SwapStatus.MILKMAN_CREATED;
  }

  function getTransactionStatus(swapStatus: SwapStatus[]) {
    if (swapStatus.every((status) => status === SwapStatus.CANCELED)) {
      return TransactionStatus.CANCELED;
    }
    if (swapStatus.every((status) => status === SwapStatus.EXECUTED)) {
      return TransactionStatus.EXECUTED;
    }

    if (
      swapStatus.every(
        (status) =>
          status === SwapStatus.CANCELED || status === SwapStatus.EXECUTED
      )
    ) {
      return TransactionStatus.EXECUTED_AND_CANCELED;
    }
    if (swapStatus.some((status) => status === SwapStatus.EXECUTED)) {
      return TransactionStatus.PARTIALLY_EXECUTED;
    }

    const allOrdersPlaced = swapStatus.every(
      (status) => status === SwapStatus.ORDER_PLACED
    );

    if (allOrdersPlaced) {
      return TransactionStatus.ORDER_PLACED;
    }

    return TransactionStatus.MILKMAN_CREATED;
  }

  const swapStatus = transaction.swaps.map((swap, i) =>
    getSwapStatus(hasToken?.[i], cowOrders?.[i])
  );
  const transactionStatus = getTransactionStatus(swapStatus);
  const txUrl = buildBlockExplorerTxUrl({
    chainId: transaction.swaps[0].chainId,
    txHash: transaction.id,
  });

  const [showOrdersRows, setShowOrdersRows] = useState(false);

  const equalTokensIn = transaction.swaps.every(
    (swap) => swap.tokenIn?.id == transaction.swaps[0].tokenIn?.id
  );

  const equalTokensOut = transaction.swaps.every(
    (swap) => swap.tokenOut?.id == transaction.swaps[0].tokenOut?.id
  );

  const decimalsTokenIn = transaction.swaps[0].tokenIn?.decimals || 18;

  const totalAmountTokenIn = transaction.swaps.reduce(
    (acc, swap) =>
      acc + Number(formatUnits(swap.tokenAmountIn, decimalsTokenIn)),
    0
  );

  return (
    <>
      <Table.BodyRow key={transaction.id}>
        <Table.BodyCell>
          <button onClick={() => setShowOrdersRows(!showOrdersRows)}>
            {showOrdersRows ? (
              <ArrowUpIcon className="h-5 w-5 text-blue9 hover:text-blue10" />
            ) : (
              <ArrowDownIcon className="h-5 w-5 text-blue9 hover:text-blue10" />
            )}
          </button>
        </Table.BodyCell>
        <Table.BodyCell>
          {equalTokensIn ? (
            <TokenInfo
              id={transaction.swaps[0].tokenIn?.id}
              symbol={transaction.swaps[0].tokenIn?.symbol}
              chainId={transaction.swaps[0].chainId}
            />
          ) : (
            "Multiple Tokens"
          )}
        </Table.BodyCell>
        <Table.BodyCell>
          {equalTokensIn
            ? formatNumber(totalAmountTokenIn, 4, "decimal", "standard", 0.0001)
            : "Multiple Tokens"}
        </Table.BodyCell>
        <Table.BodyCell>
          {equalTokensOut ? (
            <TokenInfo
              id={transaction.swaps[0].tokenOut?.id}
              symbol={transaction.swaps[0].tokenOut?.symbol}
              chainId={transaction.swaps[0].chainId}
            />
          ) : (
            "Multiple Tokens"
          )}
        </Table.BodyCell>
        <Table.BodyCell>
          <div className="flex items-center gap-x-1">
            <span>{transactionStatus}</span>
            {txUrl && (
              <Link href={txUrl} target="_blank">
                <ArrowTopRightIcon className="hover:text-slate11" />
              </Link>
            )}
          </div>
        </Table.BodyCell>
        <Table.BodyCell>
          <CancelButton
            disabled={[
              TransactionStatus.EXECUTED,
              TransactionStatus.CANCELED,
              TransactionStatus.EXECUTED_AND_CANCELED,
            ].includes(transactionStatus)}
          />
        </Table.BodyCell>
      </Table.BodyRow>
      {showOrdersRows &&
        transaction.swaps.map((order, index) => (
          <TableRowOrder
            key={order.id}
            order={order}
            orderStatus={swapStatus[index]}
          />
        ))}
    </>
  );
}

function TableRowOrder({
  order,
  orderStatus,
}: {
  order: AllTransactionFromUserQuery["users"][0]["transactions"][0]["swaps"][0];
  orderStatus: SwapStatus;
}) {
  const txUrl = buildBlockExplorerTxUrl({
    chainId: order.chainId,
    txHash: order.transactionHash,
  });

  const tokenInDecimals = order.tokenIn?.decimals || 18;
  const tokenInAmount = formatUnits(order.tokenAmountIn, tokenInDecimals);
  return (
    <Table.BodyRow key={order.id} classNames="bg-slate4">
      <Table.BodyCell>
        <Dialog
          customWidth="w-[100vw] max-w-[550px]"
          content={<TransactionInfo order={order} />}
        >
          <button>
            <InfoCircledIcon className="h-5 w-5 text-blue9 hover:text-blue10" />
          </button>
        </Dialog>
      </Table.BodyCell>
      <Table.BodyCell>
        <TokenInfo
          id={order.tokenIn?.id}
          symbol={order.tokenIn?.symbol}
          chainId={order.chainId}
        />
      </Table.BodyCell>
      <Table.BodyCell>
        {formatNumber(tokenInAmount, 4, "decimal", "standard", 0.0001)}
      </Table.BodyCell>
      <Table.BodyCell>
        <TokenInfo
          id={order.tokenOut?.id}
          symbol={order.tokenOut?.symbol}
          chainId={order.chainId}
        />
      </Table.BodyCell>
      <Table.BodyCell>
        <div className="flex items-center gap-x-1">
          <span>{orderStatus}</span>
          {txUrl && (
            <Link href={txUrl} target="_blank">
              <ArrowTopRightIcon className="hover:text-slate11" />
            </Link>
          )}
        </div>
      </Table.BodyCell>
      <Table.BodyCell>
        <span className="sr-only">Cancel</span>
      </Table.BodyCell>
    </Table.BodyRow>
  );
}

function CancelButton({ disabled }: { disabled: boolean }) {
  return (
    <button type="button" className="flex items-center" disabled={disabled}>
      <TrashIcon
        className={cn(
          "h-5 w-5",
          disabled ? "text-slate10" : "text-tomato9 hover:text-tomato10"
        )}
      />
    </button>
  );
}

function TransactionInfo({
  order,
}: {
  order: AllTransactionFromUserQuery["users"][0]["transactions"][0]["swaps"][0];
}) {
  const priceChecker = getPriceCheckerFromAddressAndChain(
    order.chainId as 5,
    order.priceChecker as Address
  );

  const expecetedArguments = priceChecker
    ? priceCheckersArgumentsMapping[priceChecker]
    : [];

  const decodedArgs = priceChecker
    ? decodePriceCheckerData(priceChecker, order.priceCheckerData as Address)
    : [];

  const priceCheckerExplorerUrl = buildBlockExplorerAddressURL({
    chainId: order.chainId,
    address: order.priceChecker as Address,
  });

  const decodedDataSuccess = decodedArgs && expecetedArguments;
  return (
    <div className="text-white">
      <div className="font-semibold text-2xl flex justify-between">
        Price Checker Data -{" "}
        {order.tokenIn?.symbol || truncateAddress(order.tokenIn?.id)} for{" "}
        {order.tokenOut?.symbol || truncateAddress(order.tokenOut?.id)}
      </div>
      <hr className="mb-2" />
      <div className="flex flex-col">
        <div className="flex items-center gap-x-1">
          <span>
            Price Checker: {priceChecker || "Not found"}{" "}
            {`(${truncateAddress(order.priceChecker as Address)})`}
          </span>
          {priceCheckerExplorerUrl && (
            <Link href={priceCheckerExplorerUrl.url} target="_blank">
              <ArrowTopRightIcon className="hover:text-slate11" />
            </Link>
          )}
        </div>
        {decodedDataSuccess &&
          decodedArgs.map((argument, index) => (
            <div key={index}>
              {expecetedArguments[index].label} :{" "}
              {expecetedArguments[index].convertOutput(
                argument,
                order.tokenOut?.decimals || 18
              )}
            </div>
          ))}
        {!decodedDataSuccess && (
          <span>Price Checker Data: Error decoding data</span>
        )}
      </div>
    </div>
  );
}

function TokenInfo({
  symbol,
  id,
  chainId,
}: {
  symbol?: string | null;
  id?: string;
  chainId?: number;
}) {
  const tokenLogoUri = cowTokenList.find(
    (token) => token.address === id && token.chainId === chainId
  )?.logoURI;
  return (
    <div className="flex items-center gap-x-1">
      <div className="w-12">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-white p-1">
            <Image
              src={tokenLogoUri || "/assets/generic-token-logo.png"}
              className="rounded-full"
              alt="Token Logo"
              height={28}
              width={28}
              quality={100}
            />
          </div>
        </div>
      </div>
      {symbol ?? truncateAddress(id)}
    </div>
  );
}
