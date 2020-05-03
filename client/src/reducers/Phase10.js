import { createSlice, createAction } from "@reduxjs/toolkit";

function getInitialState() {
  return {};
}

export const phase10 = createSlice({
  name: "Phase10",
  initialState: getInitialState(),
  reducers: {
    joinGame(state) {
      state.error = null;
      state.isLoading = true;
    },
    joinGameSuccess(_, action) {
      return action.payload;
    },
    joinGameError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    leaveGame() {
      return getInitialState();
    },
  },
});

// const mockData = {
//   joinGameSuccess: {
//     action: "joinGameSuccess",
//     payload: {
//       color: 0,
//       stacks: { available: [], discarded: [] },
//       dices: [],
//       activePlayer: null,
//       players: [
//         {
//           id: "Lt8DGc7_FiACEcw=",
//           name: "Yoni",
//           phase: 1,
//           boardPosition: 0,
//           cards: [],
//           collections: [],
//         },
//       ],
//     },
//   },
//   joinGameError: {
//     action: "joinGameError",
//     payload: "error_message",
//   },
// };

phase10.actions.joinGame = createAction("Phase10/joinGame", (name) => ({
  payload: { name },
  meta: {
    useSocket: true,
    // response: mockData.joinGameSuccess,
  },
}));

phase10.actions.leaveGame = createAction("Phase10/leaveGame", () => ({
  meta: {
    closeSocket: true,
  },
}));

// const delay = (timeout) =>
//   new Promise((resolve) => {
//     setTimeout(resolve, timeout);
//   });

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
    console.info("Socket closed");
  };

  socket.onmessage = function (event) {
    console.info("Socket message", event);
    const msg = JSON.parse(event.data);
    store.dispatch({
      type: `Phase10/${msg.action}`,
      payload: msg.payload,
    });
  };

  return socket;
}

let socket = null;
phase10.middleware = (store) => (next) => (action) => {
  console.log("Phase10Middleware", action);

  if (action.meta) {
    if (action.meta.closeSocket && socket) {
      socket.close();
    } else if (action.meta.useSocket) {
      const data = JSON.stringify({
        action: action.type.replace("Phase10/", ""),
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
