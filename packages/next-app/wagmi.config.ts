/** @type {import('@wagmi/cli').Config} */
import { defineConfig } from "@wagmi/cli";
import { foundry, react } from "@wagmi/cli/plugins";
import * as chains from "wagmi/chains";

import { vaultAbi } from "./src/abis/vault";

export default defineConfig({
  out: "src/wagmi/generated.ts",
  contracts: [
    {
      name: "vault",
      abi: vaultAbi,
      address: {
        [chains.goerli.id]: "0xBA12222222228d8Ba445958a75a0704d566BF2C8",
      },
    },
  ],
  plugins: [
    foundry({
      artifacts: "out/PoolMetadataRegistry.sol",
      deployments: {
        // TODO: here you'd update the addresses to the ones you deployed to
        PoolMetadataRegistry: {
          [chains.goerli.id]: "0x3D2C019C906C36fB05e6Ca28395E9E7d603d6CA0",
          [chains.polygon.id]: "0x68fd16B6D2D1D4AA042009872b08f3756Cc76261",
        },
      },
      exclude: ["../contracts/lib/**"],
      project: "../contracts",
    }),
    react(),
  ],
});
