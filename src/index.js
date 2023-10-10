const { publishPriceLevels, processMessage } = require("./messages");
const { getWebsocketConnection } = require("./webSocket");

const levelsInterval = setInterval(() => publishPriceLevels(mainSocket), 1000);

const onMessageCallback = (message) => processMessage(mainSocket, message);

const onCloseCallback = () => {
  clearInterval(levelsInterval);
  mainSocket = connectToNative();
};

const connectToNative = () => {
  return getWebsocketConnection(onMessageCallback, onCloseCallback, () => null);
};

let mainSocket = connectToNative();
