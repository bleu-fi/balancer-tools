import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useForm } from "react-hook-form";

import Button from "#/components/Button";
import { Input } from "#/components/Input";
import { Form } from "#/components/ui/form";
import {
  AnalysisData,
  usePoolSimulator,
} from "#/contexts/PoolSimulatorContext";
import { getStableSwapSimulatorTokensSchema } from "#/lib/schema";

import { TokensData } from "../(types)";
import { useTokenTableContext } from "./TokenTable";

export default function TokenForm({
  symbolToEdit,
  close,
}: {
  symbolToEdit?: string;
  close?: () => void;
}) {
  const { initialData, setInitialData, customData, setCustomData } =
    usePoolSimulator();
  const { custom } = useTokenTableContext();

  const stableSwapTokensSchema = getStableSwapSimulatorTokensSchema({
    symbolToEdit,
    existentSymbols: initialData?.tokens?.map((token: TokensData) => {
      return token.symbol;
    }),
  });
  const form = useForm<typeof stableSwapTokensSchema._type>({
    resolver: zodResolver(stableSwapTokensSchema),
  });

  const { register } = form;

  const tokens = custom ? customData?.tokens : initialData?.tokens;
  const currentToken = tokens?.find(
    (token: TokensData) => token.symbol == symbolToEdit
  );

  const validateUniqueSymbol = (symbol: string) => {
    const tokensToCheck = initialData?.tokens?.filter(
      (token: TokensData) => token.symbol != symbolToEdit
    );
    const symbolsToCheck = tokensToCheck?.map(
      (token: TokensData) => token.symbol
    );
    if (symbolsToCheck?.includes(symbol)) {
      return "This symbol already exists. Please define another name.";
    }
    return true;
  };

  function addToken({
    analysisData,
    setAnalysisData,
    data,
  }: {
    analysisData: AnalysisData;
    setAnalysisData: (data: AnalysisData) => void;
    data: TokensData;
  }) {
    setAnalysisData({
      ...analysisData,
      tokens: [
        ...(analysisData?.tokens || []),
        {
          ...data,
        },
      ],
    });
  }

  function editSymbol({
    analysisData,
    setAnalysisData,
    data,
  }: {
    analysisData: AnalysisData;
    setAnalysisData: (data: AnalysisData) => void;
    data: TokensData;
  }) {
    setAnalysisData({
      ...analysisData,
      tokens: analysisData?.tokens?.map((token: TokensData) => {
        if (token.symbol == symbolToEdit) {
          return {
            ...token,
            symbol: data.symbol,
          };
        }
        return token;
      }),
    });
  }

  function editAll({
    analysisData,
    setAnalysisData,
    data,
  }: {
    analysisData: AnalysisData;
    setAnalysisData: (data: AnalysisData) => void;
    data: TokensData;
  }) {
    setAnalysisData({
      ...analysisData,
      tokens: analysisData?.tokens?.map((token: TokensData) => {
        if (token.symbol == symbolToEdit) {
          return {
            ...data,
          };
        }
        return token;
      }),
    });
  }

  function handleEdit(data: TokensData) {
    // Edit the balance and rate on the table
    // and the symbol on the baseline and custom
    if (custom) {
      editAll({
        analysisData: customData,
        setAnalysisData: setCustomData,
        data,
      });
      editSymbol({
        analysisData: initialData,
        setAnalysisData: setInitialData,
        data,
      });
      return;
    }
    editAll({
      analysisData: initialData,
      setAnalysisData: setInitialData,
      data,
    });
    editSymbol({
      analysisData: customData,
      setAnalysisData: setCustomData,
      data,
    });
  }

  function handleAdd(data: TokensData) {
    addToken({
      analysisData: customData,
      setAnalysisData: setCustomData,
      data,
    });
    addToken({
      analysisData: initialData,
      setAnalysisData: setInitialData,
      data,
    });
  }

  function onSubmit(data: TokensData) {
    if (symbolToEdit) {
      handleEdit(data);
    } else {
      handleAdd(data);
    }
    close?.();
  }

  return (
    <Form onSubmit={onSubmit} id="token-form" {...form}>
      <div className="flex flex-col gap-y-4">
        <Input
          label="Symbol"
          placeholder="Define the token symbol"
          defaultValue={currentToken?.symbol}
          {...register("symbol", {
            required: true,
            validate: validateUniqueSymbol,
          })}
        />
        <Input
          label="Balance"
          placeholder="Define the token balance"
          defaultValue={currentToken?.balance}
          {...register("balance", {
            valueAsNumber: true,
            min: 0,
            required: true,
          })}
        />
        <Input
          label="Decimals"
          placeholder="Define the token decimals"
          defaultValue={currentToken?.decimal}
          {...register("decimal", {
            valueAsNumber: true,
            min: 0,
            required: true,
          })}
        />
        <Input
          label="Rate"
          placeholder="Define the token price rate"
          defaultValue={currentToken?.rate}
          {...register("rate", {
            valueAsNumber: true,
            min: 0,
            required: true,
          })}
        />
      </div>
      <div className="mt-4 flex items-center justify-end gap-3">
        <Dialog.Close asChild>
          <Button shade="light" variant="outline">
            Cancel
          </Button>
        </Dialog.Close>
        <Button form="token-form" type="submit" shade="light">
          {symbolToEdit ? "Edit" : "Add"}
        </Button>
      </div>
    </Form>
  );
}
