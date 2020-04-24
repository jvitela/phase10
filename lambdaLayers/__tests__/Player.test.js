const Player = require("../phase10/entities/Player");

describe("Player", () => {
  test("export", () => {
    expect(Player).toBeInstanceOf(Function);
  });

  test("constructor", () => {
    const player = new Player();
    expect(player).toBeInstanceOf(Player);
  });

  test("properties", () => {
    const player = new Player("123", "John Doe");
    expect(player.connectionId).toBe("123");
    expect(player.name).toBe("John Doe");
    expect(player.phase).toBe(1);
    expect(player.boardPosition).toBe(0);
    expect(player.cards).toEqual([]);
    expect(player.collections).toEqual([]);
  });
});
