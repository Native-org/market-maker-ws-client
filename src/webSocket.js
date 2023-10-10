const WebSocket = require("ws");
const { MARKET_MAKER_API_KEY, NATIVE_WS_API_URL } = require("./config");

function getWebsocketConnection(
  onMessageCallBack,
  onCloseCallback,
  onHeartbeatCallback
) {
  const ws = new WebSocket(`${NATIVE_WS_API_URL}`, {
    headers: { apiKey: MARKET_MAKER_API_KEY },
  });

  const heartbeat = () => {
    console.log("Websocket heartbeat.");
    onHeartbeatCallback();
  };

  ws.on("open", heartbeat);
  ws.on("ping", heartbeat);
  ws.on("message", (message) => onMessageCallBack(message));

  ws.on("close", () => {
    console.log("Websocket connection closed.");

    setTimeout(() => {
      ws.removeAllListeners();
      onCloseCallback();
    }, 5000);
  });

  ws.on("error", (err) => {
    console.error(`Websocket error: ${err.message}`);
  });

  return ws;
}

function sendMessage(ws, messageType, message) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({ event: "message", data: { messageType, message } })
    );
  }
}

module.exports = { getWebsocketConnection, sendMessage };
