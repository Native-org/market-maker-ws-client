const ethers = require("ethers");
const { POOL_ADDRESS, SIGNER_PRIVATE_KEY } = require("../config");

async function signQuote(data, chainId) {
  const signatureData = {
    types: {
      Order: [
        { name: "id", type: "uint256" },
        { name: "signer", type: "address" },
        { name: "buyer", type: "address" },
        { name: "seller", type: "address" },
        { name: "buyerToken", type: "address" },
        { name: "sellerToken", type: "address" },
        { name: "buyerTokenAmount", type: "uint256" },
        { name: "sellerTokenAmount", type: "uint256" },
        { name: "deadlineTimestamp", type: "uint256" },
        { name: "caller", type: "address" },
        { name: "quoteId", type: "bytes16" },
      ],
    },
    primaryType: "Order",
    domain: {
      name: "native pool",
      version: "1",
      chainId: chainId,
      verifyingContract: POOL_ADDRESS, //assume pool address is the same accross chain
    },
    message: data,
  };

  const signer = new ethers.Wallet(SIGNER_PRIVATE_KEY);

  const signature = await signer._signTypedData(
    signatureData.domain,
    signatureData.types,
    signatureData.message
  );
  return signature;
}

module.exports = { signQuote };
