import { phase10 } from "redux/Phase10";

function initSocket(store, data) {
  const socket = new WebSocket(
    "wss://ht2fzngod8.execute-api.eu-central-1.amazonaws.com/dev"
  );

  socket.onerror = function (error) {
    console.error("Socket error", error);
  };

  socket.onopen = function () {
    console.info("Socket open");
    if (data) {
      socket.send(data);
    }
  };

  socket.onclose = function () {
    // TODO: Attempt to reconnect if connection was lost?
    console.info("Socket closed");
  };

  socket.onmessage = function (event) {
    console.info("Socket message", event);
    const msg = JSON.parse(event.data);
    store.dispatch({
      type: `${phase10.name}/${msg.action}`,
      payload: msg.payload,
    });
  };

  return socket;
}

let socket = null;
export const socketCommsMiddleware = (store) => (next) => (action) => {
  console.log("socketCommsMiddleware", action);

  if (action.meta) {
    if (action.meta.closeSocket && socket) {
      socket.close();
      socket = null;
    } else if (action.meta.useSocket) {
      const data = JSON.stringify({
        action: action.type.replace(`${phase10.name}/`, ""),
        payload: action.payload,
      });

      if (!socket) {
        socket = initSocket(store, data);
      } else {
        socket.send(data);
      }
    }
  }

  return next(action);
};
