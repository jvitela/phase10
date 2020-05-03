import { addNotice } from "components/Notifications";
import { getColorName } from "Colors";
import { phase10 } from "redux/Phase10";

const sideEffects = {
  [phase10.actions.playerLeftGame]: (action) => {
    const { name, color } = action.payload;
    addNotice(
      "TOASTS",
      `Player ${name} (${getColorName(color)}) left the game`,
      2000
    );
  },

  [phase10.actions.playerJoinedGame]: (action) => {
    const { player, color } = action.payload;
    addNotice(
      "TOASTS",
      `Player ${player.name} (${getColorName(color)}) joined the game`,
      2000
    );
  },
};

export const sideEffectsMiddleware = (store) => (next) => (action) => {
  const sideEffect = sideEffects[action.type];

  if (sideEffect) {
    sideEffect(action, store);
  }

  return next(action);
};
