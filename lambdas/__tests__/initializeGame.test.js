const initializeGame = require("../startGame/initializeGame");

describe("initializeGame", () => {
  test("export", () => {
    expect(initializeGame).toBeInstanceOf(Function);
  });

  test("result", () => {
    const players = [
      { isReady: false, id: null, cards: [] },
      { isReady: true, id: "1a", cards: [] },
      { isReady: false, id: null, cards: [] },
      { isReady: true, id: "1b", cards: [] },
    ];
    const game = initializeGame(players);
    expect([1, 3]).toContain(game.activePlayer);
    expect(game.stacks.discarded.length).toBe(5);
    expect(game.stacks.available.length).toBe(71);
    expect(game.players.length).toBe(4);
    expect(game.players[0].cards.length).toBe(0);
    expect(game.players[1].cards.length).toBe(10);
    expect(game.players[2].cards.length).toBe(0);
    expect(game.players[3].cards.length).toBe(10);
    expect(game.dices.length).toBe(2);
    expect(game.dices[0]).toBeGreaterThanOrEqual(1);
    expect(game.dices[0]).toBeLessThanOrEqual(6);
  });
});
