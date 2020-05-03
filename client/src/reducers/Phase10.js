import { createSlice, createAction } from "@reduxjs/toolkit";
import { addNotice } from "components/Notifications";

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
    playerJoinedGame(state, action) {
      const { player, color } = action.payload;
      state.players[color] = player;
    },
    playerLeftGame(state, action) {
      const { color } = action.payload;
      state.players[color] = null;
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
    // TODO: Attempt to reconnect if connection was lost?
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
      socket = null;
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

  if (action.type === "Phase10/playerLeftGame") {
    const { name, color } = action.payload;
    addNotice(
      "TOASTS",
      `Player ${name} (${getColorName(color)}) left the game`,
      2000
    );
  }

  if (action.type === "Phase10/playerJoinedGame") {
    const { player, color } = action.payload;
    addNotice(
      "TOASTS",
      `Player ${player.name} (${getColorName(color)}) joined the game`,
      2000
    );
  }

  return next(action);
};

const colorNames = ["Red", "Green", "Blue", "Yellow", "Black", "White"];
function getColorName(color) {
  return color < colorNames.length ? colorNames[color] : null;
}
