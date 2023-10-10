const BigNumber = require("bignumber.js");

const Networks = {
  MAINNET: 1,
  POLYGON: 137,
  BSC: 56,
  ARBITRUM: 42161,
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const TOKENS = [
  {
    name: "ETH",
    displayName: "Ethereum",
    decimalsByNetworkId: {
      [Networks.MAINNET]: 18,
    },
    addressByNetworkId: {
      [Networks.MAINNET]: ZERO_ADDRESS,
    },
  },
  {
    name: "USDC",
    displayName: "USD Coin",
    decimalsByNetworkId: {
      [Networks.MAINNET]: 6,
      [Networks.POLYGON]: 6,
      [Networks.ARBITRUM]: 6,
    },
    addressByNetworkId: {
      [Networks.MAINNET]: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      [Networks.POLYGON]: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      [Networks.ARBITRUM]: "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
    },
  },
  {
    name: "USDT",
    displayName: "Tether",
    decimalsByNetworkId: {
      [Networks.MAINNET]: 6,
      [Networks.POLYGON]: 6,
      [Networks.BSC]: 18,
      [Networks.ARBITRUM]: 6,
    },
    addressByNetworkId: {
      [Networks.MAINNET]: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      [Networks.POLYGON]: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
      [Networks.BSC]: "0x55d398326f99059ff775485246999027b3197955",
      [Networks.ARBITRUM]: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
    },
  },
  {
    name: "DAI",
    displayName: "DAI",
    decimalsByNetworkId: {
      [Networks.MAINNET]: 18,
      [Networks.POLYGON]: 18,
    },
    addressByNetworkId: {
      [Networks.MAINNET]: "0x6b175474e89094c44da98b954eedeac495271d0f",
      [Networks.POLYGON]: "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
    },
  },
  {
    name: "GRT",
    displayName: "GRT",
    decimalsByNetworkId: {
      [Networks.MAINNET]: 18,
      [Networks.POLYGON]: 18,
    },
    addressByNetworkId: {
      [Networks.MAINNET]: "0xc944e90c64b2c07662a292be6244bdf05cda44a7",
    },
  },

  // TODO: Add other tokens you support
];

function getTokenByAddress(networkId, address) {
  return TOKENS.find(
    (t) =>
      t.addressByNetworkId[networkId]?.toLowerCase() === address.toLowerCase()
  );
}

function getTokenByName(name) {
  return TOKENS.find((t) => t.name.toUpperCase() === name.toUpperCase());
}

function convertFromDecimals(amount, token, networkId) {
  const decimals = token.decimalsByNetworkId[networkId];
  return amount.dividedBy(new BigNumber(10).pow(decimals));
}

function convertToDecimals(amount, token, networkId) {
  const decimals = token.decimalsByNetworkId[networkId];
  return amount.multipliedBy(new BigNumber(10).pow(decimals));
}

module.exports = {
  TOKENS,
  getTokenByAddress,
  getTokenByName,
  convertFromDecimals,
  convertToDecimals,
};
