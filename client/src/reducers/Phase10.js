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

const mockData = {
  joinGameSuccess: {
    action: "joinGameSuccess",
    payload: {
      color: 0,
      stacks: { available: [], discarded: [] },
      dices: [],
      activePlayer: null,
      players: [
        {
          id: "Lt8DGc7_FiACEcw=",
          name: "Yoni",
          phase: 1,
          boardPosition: 0,
          cards: [],
          collections: [],
        },
      ],
    },
  },
  joinGameError: {
    action: "joinGameError",
    payload: "error_message",
  },
};

phase10.actions.joinGame = createAction("Phase10/joinGame", (name) => ({
  payload: { name },
  meta: {
    useSocket: true,
    response: mockData.joinGameSuccess,
  },
}));

phase10.actions.leaveGame = createAction("Phase10/leaveGame", () => ({
  meta: {
    useSocket: true,
  },
}));

const delay = (timeout) =>
  new Promise((resolve) => {
    setTimeout(resolve, timeout);
  });

function initSocket(store) {
  async function respond(msg) {
    if (!msg) {
      return;
    }
    await delay(1000);
    store.dispatch({
      type: `Phase10/${msg.action}`,
      payload: msg.payload,
    });
  }

  return {
    send(data) {
      console.log("socket.send", data);
      return { respond };
    },
  };
}

phase10.middleware = (store) => (next) => (action) => {
  let socket = null;
  console.log("Phase10Middleware", action);

  if (action.meta && action.meta.useSocket) {
    if (!socket) {
      socket = initSocket(store);
    }
    socket
      .send(
        JSON.stringify({
          action: action.type.replace("Phase10/", ""),
          payload: action.payload,
        })
      )
      .respond(action.meta.response);
    // return;
  }

  return next(action);
};
