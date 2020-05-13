const initializeGame = require("../startGame/initializeGame");

describe("initializeGame", () => {
  test("export", () => {
    expect(initializeGame).toBeInstanceOf(Function);
  });

  test("result", () => {
    const players = [{ id: null }, { id: "1a" }, { id: null }, { id: "1b" }];
    const game = initializeGame(players);
    expect([1, 3]).toContain(game.activePlayer);
    expect(game.stacks.discarded.length).toBe(5);
    expect(game.stacks.available.length).toBe(91);
    expect(game.dices.length).toBe(2);
    expect(game.dices[0]).toBeGreaterThanOrEqual(1);
    expect(game.dices[0]).toBeLessThanOrEqual(6);
  });
});
