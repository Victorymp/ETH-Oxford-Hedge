export const FLARE_RPC_URL =
  process.env.NEXT_PUBLIC_FLARE_RPC_URL ||
  "https://coston2-api.flare.network/ext/C/rpc";

export const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0x1a82fDF4d2603A84AA29389959a27878E293865B";

// Feed indices in the HedgePriceFeed contract
export const FEED_INDEX = {
  FLR: 0,
  BTC: 1,
  ETH: 2,
  XRP: 3,
  SOL: 4,
  DOGE: 5,
};

// Polling interval for price updates (ms)
export const PRICE_POLL_INTERVAL = 5000;

// Minimal ABI — only the view functions we need
export const HEDGE_PRICE_ABI = [
  {
    inputs: [],
    name: "getAllPrices",
    outputs: [
      { internalType: "string[]", name: "symbols", type: "string[]" },
      { internalType: "uint256[]", name: "prices", type: "uint256[]" },
      { internalType: "int8[]", name: "decimals", type: "int8[]" },
      { internalType: "uint64", name: "timestamp", type: "uint64" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [{ internalType: "uint256", name: "feedIndex", type: "uint256" }],
    name: "getFeedPrice",
    outputs: [
      { internalType: "string", name: "symbol", type: "string" },
      { internalType: "uint256", name: "price", type: "uint256" },
      { internalType: "int8", name: "decimals", type: "int8" },
      { internalType: "uint64", name: "timestamp", type: "uint64" },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getFeedCount",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
];
