//TODO: Market Maker API key must be whitelisted by Native team first
const MARKET_MAKER_API_KEY = "testMM";

const NATIVE_WS_API_URL = "https://newapi.beyourowndex.com/v1/pmm/ws";

// TODO: Add correct pool
const POOL_ADDRESS = "0x123456789abcdef0123456789abcdef012345678";

// TODO: Replace with pool signer private key –– avoid putting here in plaintext for security reasons
const SIGNER_PRIVATE_KEY =
  "b5c0608fcd86751627012c2871120a553666561b618bef0860c98c45c1b50d60";

module.exports = {
  MARKET_MAKER_API_KEY,
  NATIVE_WS_API_URL,
  POOL_ADDRESS,
  SIGNER_PRIVATE_KEY,
};
