"use client";

import { Subgraph, SUBGRAPHS } from "@bleu-balancer-tools/gql/codegen";
import balancerSdks from "@bleu-balancer-tools/gql/src/balancer";
import gaugesSdks from "@bleu-balancer-tools/gql/src/balancer-gauges";
import poolMetadataSdks from "@bleu-balancer-tools/gql/src/balancer-pools-metadata";
import blocksSdks from "@bleu-balancer-tools/gql/src/chains-blocks";
import {
  Address,
  DELEGATE_OWNER,
  Network,
  networkFor,
  networkMultisigs,
} from "@bleu-balancer-tools/utils";
import { GraphQLClient } from "graphql-request";

export function impersonateWhetherDAO(
  chainId: string,
  address: Address | undefined,
) {
  const network = networkFor(chainId);

  if (
    network !== Network.Goerli &&
    network !== Network.Sepolia &&
    network !== Network.Gnosis &&
    network !== Network.Optimism &&
    network !== Network.Arbitrum &&
    network !== Network.PolygonZKEVM &&
    networkMultisigs[network] === address
  ) {
    return DELEGATE_OWNER;
  }
  return address;
}

const clientFor = (client: Subgraph) => (chainId: string) => {
  const network = networkFor(chainId);
  const endpoint = SUBGRAPHS[client].endpointFor(network);
  return new GraphQLClient(endpoint);
};

export const pools = {
  client: clientFor(Subgraph.Balancer),
  gql: (chainId: number | string) =>
    balancerSdks[networkFor(chainId)](pools.client(String(chainId))),
};

export const poolsMetadata = {
  client: clientFor(Subgraph.BalancerPoolsMetadata),
  gql: (chainId: number | string) =>
    poolMetadataSdks[networkFor(chainId)](
      poolsMetadata.client(String(chainId)),
    ),
};

export const gauges = {
  client: clientFor(Subgraph.BalancerGauges),
  gql: (chainId: number | string) =>
    gaugesSdks[networkFor(chainId)](gauges.client(String(chainId))),
};

export const internalBalances = {
  client: clientFor(Subgraph.Balancer),
  gql: (chainId: number | string) =>
    balancerSdks[networkFor(chainId)](internalBalances.client(String(chainId))),
};

export const blocks = {
  client: clientFor(Subgraph.ChainsBlocks),
  gql: (chainId: number | string) =>
    blocksSdks[networkFor(chainId)](blocks.client(String(chainId))),
};
