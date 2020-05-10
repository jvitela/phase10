const ANY = Symbol("ANY");
const DRAW1 = Symbol("DRAW1");
const DRAW2 = Symbol("DRAW2");
const DRAW3 = Symbol("DRAW3");
const JOKER = Symbol("JOKER");
const DRAW1_AND_DICE = Symbol("DRAW1_AND_DICE");
const ASK = Symbol("ASK");
const SEARCH_DISCARDS = Symbol("SEARCH_DISCARDS");
const DISCARD_AND_DRAW = Symbol("SEARCH_DISCARDS");
const ALL_DRAW1 = Symbol("SEARCH_DISCARDS");

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
