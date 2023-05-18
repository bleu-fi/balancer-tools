import { capitalizeFirstLetter, Network } from "@balancer-pool-metadata/shared";
import { CodegenConfig } from "@graphql-codegen/cli";

export enum Subgraph {
  BalancerPoolsMetadata = "balancer-pools-metadata",
  BalancerGauges = "balancer-gauges",
  BalancerPools = "balancer-pools",
  BalancerInternalManager = "balancer-internal-manager",
}

// IMPORTANT NOTE:
// The endpointFor function expects every network has an endpoint
// If a network doesn't have an endpoint, it will throw an error
// to not break the build and raise an error we used the Goerli endpoints for
// all the networks that don't have an subgraph deployed yet
// this will be removed once we have all the subgraphs deployed
// TODO: https://linear.app/bleu-llc/issue/BAL-131/deploy-contracts-in-all-networks-that-balancer-is-deployed
// https://linear.app/bleu-llc/issue/BAL-290/deploy-subgraph-with-token-relation-on-other-networks

export const SUBGRAPHS = {
  [Subgraph.BalancerPoolsMetadata]: {
    name: Subgraph.BalancerPoolsMetadata,
    endpoints() {
      const baseEndpoint = "https://api.thegraph.com/subgraphs/name/bleu-llc";

      return {
        [Network.Ethereum]: `${baseEndpoint}/balancer-pools-metadata`,
        [Network.Polygon]: `${baseEndpoint}/balancer-metadata-polygon`,
        [Network.Arbitrum]: `${baseEndpoint}/balancer-metadata-goerli`,
        [Network.Gnosis]: `${baseEndpoint}/balancer-metadata-goerli`,
        [Network.Optimism]: `${baseEndpoint}/balancer-metadata-goerli`,
        [Network.Goerli]: `${baseEndpoint}/balancer-metadata-goerli`,
        [Network.Sepolia]: `${baseEndpoint}/balancer-metadata-goerli`,
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
  [Subgraph.BalancerGauges]: {
    name: Subgraph.BalancerGauges,
    endpoints() {
      const baseEndpoint =
        "https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-gauges";

      return {
        [Network.Ethereum]: `${baseEndpoint}`,
        [Network.Polygon]: `${baseEndpoint}-polygon`,
        [Network.Arbitrum]: `${baseEndpoint}-arbitrum`,
        [Network.Gnosis]: `${baseEndpoint}-goerli`,
        [Network.Optimism]: `${baseEndpoint}-goerli`,
        [Network.Goerli]: `${baseEndpoint}-goerli`,
        [Network.Sepolia]: `${baseEndpoint}-goerli`,
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
  [Subgraph.BalancerPools]: {
    name: Subgraph.BalancerPools,
    endpoints() {
      const baseEndpoint =
        "https://api.thegraph.com/subgraphs/name/balancer-labs";

      return {
        [Network.Ethereum]: `${baseEndpoint}/balancer-v2`,
        [Network.Polygon]: `${baseEndpoint}/balancer-polygon-v2`,
        [Network.Arbitrum]: `${baseEndpoint}/balancer-arbitrum-v2`,
        [Network.Gnosis]: `${baseEndpoint}/balancer-goerli-v2`,
        [Network.Optimism]: `${baseEndpoint}/balancer-goerli-v2`,
        [Network.Goerli]: `${baseEndpoint}/balancer-goerli-v2`,
        [Network.Sepolia]: `${baseEndpoint}/balancer-goerli-v2`,
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
  [Subgraph.BalancerInternalManager]: {
    name: Subgraph.BalancerInternalManager,
    endpoints() {
      //This is a fork of the pools subgraph that's to be merged to Balancer's own subgraph
      const baseEndpoint =
        "https://api.thegraph.com/subgraphs/name/bleu-studio";
      return {
        //TODO: deploy subgraph on mainnet, polygon and arbitrum
        [Network.Ethereum]: `${baseEndpoint}/balancer-mainnet-v2`,
        [Network.Polygon]: `${baseEndpoint}/balancer-polygon-v2`,
        [Network.Arbitrum]: `${baseEndpoint}/balancer-arbitrum-v2`,
        [Network.Gnosis]: `${baseEndpoint}/balancer-gnosis-v2`,
        [Network.Optimism]: `${baseEndpoint}/balancer-optimism-v2`,
        [Network.Goerli]: `${baseEndpoint}/balancer-v2-goerli`,
        [Network.Sepolia]: `https://api.studio.thegraph.com/query/46539/balancer-sepolia-v2/v0.0.1`,
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
};

const generates = Object.assign(
  {},
  ...Object.values(SUBGRAPHS).map(({ name, endpoints }) =>
    Object.fromEntries(
      Object.entries(endpoints())
        .map(([network, endpoint]) => [
          [
            `./src/${name}/__generated__/${capitalizeFirstLetter(network)}.ts`,
            {
              schema: endpoint,
              documents: [`src/${name}/**/*.ts`],
              plugins: [
                "typescript",
                "typescript-operations",
                "typescript-graphql-request",
                "plugin-typescript-swr",
              ],
            },
          ],
          [
            `./src/${name}/__generated__/${capitalizeFirstLetter(
              network
            )}.server.ts`,
            {
              schema: endpoint,
              documents: [`src/${name}/**/*.ts`],
              plugins: [
                "typescript",
                "typescript-operations",
                "typescript-graphql-request",
              ],
            },
          ],
        ])
        .flat(1)
    )
  )
);

const config: CodegenConfig = {
  config: {
    autogenSWRKey: true,
    enumsAsTypes: true,
    futureProofEnums: true,
  },
  generates,
};

export default config;
