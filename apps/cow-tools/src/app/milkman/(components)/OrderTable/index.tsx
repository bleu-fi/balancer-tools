"use client";

import { Button } from "#/components";
import { AlertCard } from "#/components/AlertCard";
import { Spinner } from "#/components/Spinner";
import Table from "#/components/Table";
import { useUserMilkmanTransactions } from "#/hooks/useUserMilkmanTransactions";

import { TableRowTransaction } from "./TableRowTransaction";

export function OrderTable() {
  const { transactions, loaded, retry, error } = useUserMilkmanTransactions();

  if (!loaded) {
    return <Spinner />;
  }

  if (error) {
    return (
      <div className="flex justify-center">
        <AlertCard style="error" title="Fetching transactions">
          <div className="flex w-full items-center justify-center">
            <h1 className="text-md m-2 text-center">
              Ops! Something unexpected happened.
            </h1>
            <Button color="slate" onClick={retry}>
              Retry
            </Button>
          </div>
        </AlertCard>
      </div>
    );
  }

  return (
    <Table color="blue" shade="darkWithBorder" classNames="overflow-y-auto">
      <Table.HeaderRow>
        <Table.HeaderCell>
          <span className="sr-only"></span>
        </Table.HeaderCell>
        <Table.HeaderCell>Transaction Datetime</Table.HeaderCell>
        <Table.HeaderCell>Sell Token</Table.HeaderCell>
        <Table.HeaderCell>Buy Token</Table.HeaderCell>
        <Table.HeaderCell>Status</Table.HeaderCell>
        <Table.HeaderCell>
          <span className="sr-only">Cancel</span>
        </Table.HeaderCell>
      </Table.HeaderRow>
      <Table.Body classNames="max-h-80 overflow-y-auto">
        {transactions?.map((transaction) => (
          <TableRowTransaction key={transaction.id} transaction={transaction} />
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
