const ANY = 0;
const DRAW1 = 1;
const DRAW2 = 2;
const DRAW3 = 3;
const JOKER = 4;
const DRAW1_AND_DICE = 5;
const ASK = 6;
const SEARCH_DISCARDS = 7;
const DISCARD_AND_DRAW = 8;
const ALL_DRAW1 = 9;

const BOARD = [
  ANY,
  DRAW1,
  DRAW2,
  SEARCH_DISCARDS,
  ASK,
  DRAW1,
  JOKER,
  DRAW2,
  DISCARD_AND_DRAW,
  DRAW1,
  ALL_DRAW1,
  DRAW1_AND_DICE,
  DRAW3,
  ASK,
  DRAW1,
  SEARCH_DISCARDS,
  DRAW2,
  JOKER,
  DISCARD_AND_DRAW,
  DRAW1_AND_DICE,
  DRAW1,
  ALL_DRAW1,
  ASK,
  DRAW2,
  DRAW1,
  SEARCH_DISCARDS,
  DRAW1_AND_DICE,
  DRAW3,
  JOKER,
  DISCARD_AND_DRAW,
  ASK,
  ALL_DRAW1,
];

const getAction = (idx) => BOARD[idx % BOARD.length];

module.exports = {
  getAction,
  get length() {
    return BOARD.length;
  },
  actions: {
    ANY,
    DRAW1,
    DRAW2,
    DRAW3,
    JOKER,
    DRAW1_AND_DICE,
    ASK,
    SEARCH_DISCARDS,
    DISCARD_AND_DRAW,
    ALL_DRAW1,
  },
};
