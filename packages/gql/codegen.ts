import { capitalize, Network } from "@bleu/utils";
import { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";

dotenv.config();

export enum Subgraph {
  BalancerPoolsMetadata = "balancer-pools-metadata",
  BalancerGauges = "balancer-gauges",
  Balancer = "balancer",
  BalancerApiV3 = "balancer-api-v3",
  UniswapV2 = "uniswap-v2",
  Sushi = "sushi",
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
  // [Subgraph.BalancerPoolsMetadata]: {
  //   name: Subgraph.BalancerPoolsMetadata,
  //   endpoints() {
  //     const baseEndpoint =
  //       "https://api.thegraph.com/subgraphs/name/bleu-studio";

  //     return {
  //       [Network.Ethereum]: `${baseEndpoint}/balancer-pool-metadata`,
  //       [Network.Goerli]: `${baseEndpoint}/bal-pools-metadata-goerli`,
  //       [Network.Polygon]: `${baseEndpoint}/balancer-pools-metadata-matic`,
  //       [Network.Arbitrum]: `${baseEndpoint}/bal-pools-metadata-arb`,
  //       [Network.Gnosis]: `${baseEndpoint}/balancer-pools-metadata-gnosis`,
  //       [Network.Optimism]: `${baseEndpoint}/balancer-pools-metadata-op`,
  //       // TODO: deploy Base, Avalanche and sepolia subgraphs
  //       [Network.PolygonZKEVM]: `${baseEndpoint}/balancer-pool-metadata`,
  //       [Network.Base]: `${baseEndpoint}/balancer-pool-metadata`,
  //       [Network.Sepolia]: `${baseEndpoint}/balancer-pool-metadata`,
  //       [Network.Avalanche]: `${baseEndpoint}/balancer-pool-metadata`,
  //     };
  //   },
  //   endpointFor(network: Network) {
  //     return this.endpoints()[network];
  //   },
  // },
  [Subgraph.BalancerGauges]: {
    name: Subgraph.BalancerGauges,
    endpoints() {
      return {
        [Network.Ethereum]:
          "https://api.studio.thegraph.com/query/75376/balancer-gauges/version/latest",
        [Network.Sepolia]:
          "https://api.studio.thegraph.com/query/24660/balancer-gauges-sepolia/version/latest",
        [Network.Goerli]:
          "https://api.studio.thegraph.com/query/24660/balancer-gauges-sepolia/version/latest",
        [Network.Polygon]:
          "https://api.studio.thegraph.com/query/75376/balancer-gauges-polygon/version/latest",
        [Network.PolygonZKEVM]:
          "https://api.studio.thegraph.com/query/24660/balancer-gauges-polygon-zk/version/latest",
        [Network.Arbitrum]:
          "https://api.studio.thegraph.com/query/75376/balancer-gauges-arbitrum/version/latest",
        [Network.Gnosis]:
          "https://api.studio.thegraph.com/query/75376/balancer-gauges-gnosis-chain/version/latest",
        [Network.Optimism]:
          "https://api.studio.thegraph.com/query/75376/balancer-gauges-optimism/version/latest",
        [Network.Base]:
          "https://api.studio.thegraph.com/query/24660/balancer-gauges-base/version/latest",
        [Network.Avalanche]:
          "https://api.studio.thegraph.com/query/75376/balancer-gauges-avalanche/version/latest",
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
  [Subgraph.Balancer]: {
    name: Subgraph.Balancer,
    endpoints() {
      return {
        [Network.Ethereum]:
          "https://api.studio.thegraph.com/query/75376/balancer-v2/version/latest",
        [Network.Sepolia]:
          "https://api.studio.thegraph.com/query/24660/balancer-sepolia-v2/version/latest",
        [Network.Goerli]:
          "https://api.studio.thegraph.com/query/24660/balancer-sepolia-v2/version/latest",
        [Network.Polygon]:
          "https://api.studio.thegraph.com/query/75376/balancer-polygon-v2/version/latest",
        [Network.PolygonZKEVM]:
          "https://api.studio.thegraph.com/query/24660/balancer-polygon-zk-v2/version/latest",
        [Network.Arbitrum]:
          "https://api.studio.thegraph.com/query/75376/balancer-arbitrum-v2/version/latest",
        [Network.Gnosis]:
          "https://api.studio.thegraph.com/query/75376/balancer-gnosis-chain-v2/version/latest",
        [Network.Optimism]:
          "https://api.studio.thegraph.com/query/75376/balancer-optimism-v2/version/latest",
        [Network.Base]:
          "https://api.studio.thegraph.com/query/24660/balancer-base-v2/version/latest",
        [Network.Avalanche]:
          "https://api.studio.thegraph.com/query/75376/balancer-avalanche-v2/version/latest",
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
  [Subgraph.BalancerApiV3]: {
    name: Subgraph.BalancerApiV3,
    endpoints() {
      const baseEndpoint = "https://api-v3.balancer.fi/graphql";

      return {
        [Network.Ethereum]: `${baseEndpoint}`,
        [Network.Sepolia]: `${baseEndpoint}`,
        [Network.Goerli]: `${baseEndpoint}`,
        [Network.Polygon]: `${baseEndpoint}`,
        [Network.PolygonZKEVM]: `${baseEndpoint}`,
        [Network.Arbitrum]: `${baseEndpoint}`,
        [Network.Gnosis]: `${baseEndpoint}`,
        [Network.Optimism]: `${baseEndpoint}`,
        [Network.Base]: `${baseEndpoint}`,
        [Network.Avalanche]: `${baseEndpoint}`,
      };
    },
    endpointFor(network: Network) {
      return this.endpoints()[network];
    },
  },
  [Subgraph.UniswapV2]: {
    name: Subgraph.UniswapV2,
    endpoints() {
      const baseEndpoint = `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu`;
      return {
        [Network.Ethereum]: `${baseEndpoint}`,
      };
    },
    endpointFor(network: Network) {
      if (network === Network.Ethereum) {
        return this.endpoints()[network];
      }
      throw new Error(
        `UniswapV2 subgraph is not deployed on network ${network}`,
      );
    },
  },
  [Subgraph.Sushi]: {
    name: Subgraph.Sushi,
    endpoints() {
      return {
        [Network.Ethereum]: `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/A4JrrMwrEXsYNAiYw7rWwbHhQZdj6YZg1uVy5wa6g821`,
        [Network.Gnosis]: `https://gateway.thegraph.com/api/${process.env.THE_GRAPH_API_KEY}/subgraphs/id/A4JrrMwrEXsYNAiYw7rWwbHhQZdj6YZg1uVy5wa6g821`,
      };
    },
    endpointFor(network: Network) {
      if (network === Network.Ethereum || network === Network.Gnosis) {
        return this.endpoints()[network];
      }
      throw new Error(`Sushi subgraph is not deployed on network ${network}`);
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
            `./src/${name}/__generated__/${capitalize(network)}.ts`,
            {
              schema: endpoint,
              documents: [`src/${name}/*.ts`],
              plugins: [
                "typescript",
                "typescript-operations",
                "typescript-graphql-request",
                "plugin-typescript-swr",
              ],
            },
          ],
          [
            `./src/${name}/__generated__/${capitalize(network)}.server.ts`,
            {
              schema: endpoint,
              documents: [`src/${name}/*.ts`],
              plugins: [
                "typescript",
                "typescript-operations",
                "typescript-graphql-request",
              ],
            },
          ],
        ])
        .flat(1),
    ),
  ),
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
