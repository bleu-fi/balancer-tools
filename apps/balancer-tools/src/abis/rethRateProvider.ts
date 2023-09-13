export const rethRateProviderAbi = [
  {
    inputs: [
      {
        internalType: "contract RocketTokenRETHInterface",
        name: "_rocketTokenRETH",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "getRate",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "rocketTokenRETH",
    outputs: [
      {
        internalType: "contract RocketTokenRETHInterface",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
