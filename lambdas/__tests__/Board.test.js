const board = require("/opt/phase10/entities/Board");

const {
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
} = board.actions;

describe("Board", () => {
  test("export", () => {
    expect(board).toBeInstanceOf(Object);
    expect(board.getAction).toBeInstanceOf(Function);
  });

  test("length", () => {
    expect(board.length).toBe(32);
  });

  test("actions", () => {
    expect(board.actions).toEqual({
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
    });
  });

  test("getAction", () => {
    const results = [];
    for (let i = 0; i < board.length; ++i) {
      results.push(board.getAction(i));
    }
    expect(results).toEqual([
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
    ]);
  });

  test("getAction with indexes greater than board length", () => {
    expect(board.getAction(board.length)).toBe(board.getAction(0));
    expect(board.getAction(board.length + 10)).toBe(board.getAction(10));
  });
});
