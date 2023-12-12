const BigNumber = require("bignumber.js");
const {
  getTokenByAddress,
  getTokenByName,
  convertToDecimals,
  convertFromDecimals,
} = require("./helpers/token");
const { sendMessage } = require("./webSocket");
const { SUPPORTED_PAIRS, computePrices } = require("./pricing");
const { signQuote } = require("./helpers/signature");

const cachedQuotes = {};

function processMessage(ws, message) {
  let decodedMessage = {};
  try {
    decodedMessage = JSON.parse(message.toString()).data || {};
  } catch (err) {
    console.info(`Cannot parse message`);
    return;
  }

  console.log(message.toString());
  if (!decodedMessage?.messageType) return;

  switch (decodedMessage.messageType) {
    case "firmQuote":
      processMessageFirmQuote(ws, decodedMessage.message);
      return;
    case "signQuote":
      processMessageSignQuote(ws, decodedMessage.message);
      return;
    case "error":
      console.error(`WS 'error' message: ${message}`);
      return;
    default:
      return;
  }
}

function processMessageFirmQuote(ws, originalMessage) {
  const message = originalMessage;
  const chainId = message.chainId;

  if (!(chainId in SUPPORTED_PAIRS)) {
    console.error(`chainId is not supported ${JSON.stringify(message)}`);
    sendMessage(ws, "quote", { error: "pair_not_supported", originalMessage });
    return;
  }

  if (!message.quoteId) {
    console.error(
      `Missing quoteId in 'firmQuote' request. ${JSON.stringify(message)}`
    );
    sendMessage(ws, "quote", { error: "invalid_input", originalMessage });
    return;
  }

  const baseToken = getTokenByAddress(chainId, message.baseTokenAddress);
  if (!baseToken) {
    console.error(`Unknown base token: ${message.baseToken}`);
    sendMessage(ws, "quote", { error: "invalid_input", originalMessage });
    return;
  }

  const quoteToken = getTokenByAddress(chainId, message.quoteTokenAddress);
  if (!quoteToken) {
    console.error(`Unknown quote token: ${message.quoteToken}`);
    sendMessage(ws, "quote", { error: "invalid_input", originalMessage });
    return;
  }

  //TODO: add more validation here, ex: token pair is supported, liquidity is enough, etec

  const { baseTokenAmount, quoteTokenAmount } = computePrices(
    chainId,
    baseToken,
    quoteToken,
    message.baseTokenAmount,
    message.quoteTokenAmount
  );

  const apiQuote = {
    quoteId: message.quoteId,
    chainId,
    baseTokenAddress: message.baseTokenAddress,
    quoteTokenAddress: message.quoteTokenAddress,
    baseTokenAmount: baseTokenAmount.toFixed(),
    quoteTokenAmount: quoteTokenAmount.toFixed(),
    deadlineTimestamp: Math.floor(Date.now() / 1000) + 180,
  };

  // Cache data to validate during signing
  cachedQuotes[message.quoteId] = {
    ...apiQuote,
  };

  sendMessage(ws, "quote", apiQuote);
}

function processMessageSignQuote(ws, message) {
  const quoteId = message.quoteId || message.quoteData.quoteId;
  if (
    !(quoteId in cachedQuotes) ||
    !validateQuotesMatch(message.quoteData, cachedQuotes[quoteId])
  ) {
    console.error(
      `Requesting signature for unrecognized quote. ${JSON.stringify(
        message
      )}, ${JSON.stringify(cachedQuotes[quoteId])}`
    );
    sendMessage(ws, "signQuote", {
      error: "payload_not_recognized",
      originalMessage: message,
    });
    return;
  }

  signQuote(message.quoteData, message.chainId)
    .then((signature) => {
      const apiSignature = {
        quoteId: quoteId,
        signature,
      };

      sendMessage(ws, "signature", apiSignature);
    })
    .catch((err) => {
      console.log("error signing: ", err);
    });
}

function validateQuotesMatch(signQuoteData, cachedQuote) {
  return (
    signQuoteData.quoteId === cachedQuote.quoteId &&
    signQuoteData.sellerToken === cachedQuote.baseTokenAddress &&
    signQuoteData.buyerToken === cachedQuote.quoteTokenAddress &&
    signQuoteData.sellerTokenAmount === cachedQuote.baseTokenAmount &&
    signQuoteData.buyerTokenAmount === cachedQuote.quoteTokenAmount
  );
}

function publishPriceLevels(ws) {
  for (network of Object.keys(SUPPORTED_PAIRS)) {
    for (pair of SUPPORTED_PAIRS[network]) {
      const baseToken = getTokenByName(pair[0]);
      const quoteToken = getTokenByName(pair[1]);

      // TODO (if market making on aggregators): Implement own price levels
      const volumes = [1, 2, 4];
      const levels = volumes.map((level) => {
        const amount = convertToDecimals(new BigNumber(1), baseToken, network);
        const prices = computePrices(
          network,
          baseToken,
          quoteToken,
          amount,
          undefined
        );
        const priceRaw = convertFromDecimals(
          prices.quoteTokenAmount,
          quoteToken,
          network
        );
        return { quantity: String(level), price: priceRaw.toFixed() };
      });

      const baseTokenAddress = baseToken.addressByNetworkId[network];
      const quoteTokenAddress = quoteToken.addressByNetworkId[network];

      const apiPriceLevels = {
        chainId: network,
        baseTokenAddress,
        quoteTokenAddress,
        side: "buy",
        levels,
      };
      console.log("publish orderbook");
      sendMessage(ws, "orderbook", apiPriceLevels);
    }
  }
}

module.exports = { processMessage, publishPriceLevels };
