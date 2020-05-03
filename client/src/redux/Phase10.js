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
