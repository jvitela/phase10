const GameRepository = require("../phase10/repositories/GameRepository");
const { fnSuccessReq, fnErrorReq } = require("../TestUtils");

describe("GameRepository", () => {
  test("export", () => {
    expect(GameRepository).toBeInstanceOf(Function);
  });

  test("constructor", () => {
    const game = new GameRepository();
    expect(game).toBeInstanceOf(GameRepository);
  });

  test("properties", () => {
    const dynamo = {};
    const game = new GameRepository(dynamo, "Test_table");
    expect(game.db).toBe(dynamo);
    expect(game.tableName).toBe("Test_table");
  });

  test("loadGame success", () => {
    const dynamo = {
      get: fnSuccessReq({
        Item: {
          gameId: "123",
          timestamp: "456",
          state: "{}",
        },
      }),
    };
    const game = new GameRepository(dynamo);
    expect(game.load()).resolves.toEqual({
      gameId: "123",
      timestamp: "456",
      state: {},
    });
  });

  test("loadGame error", () => {
    const dynamo = {
      get: fnErrorReq(new Error("error")),
    };
    const game = new GameRepository(dynamo);
    expect(game.load()).rejects.toThrow("error");
  });

  test("saveGame success", () => {
    const data = {
      gameId: "gameId",
      timestamp: "timestamp",
      state: {},
    };
    const dynamo = {
      put: fnSuccessReq(),
    };
    const game = new GameRepository(dynamo);
    expect(() => game.save(data)).not.toThrow();
    expect(dynamo.put.mock.calls.length).toEqual(1); // Check dynamo.putItem was called once
    expect(dynamo.put.mock.calls[0].length).toEqual(1); // To be called with one param
    expect(dynamo.put.mock.calls[0][0]).toEqual({
      // First param was the serialized object
      Item: {
        gameId: "gameId",
        timestamp: "timestamp",
        state: "{}",
      },
      TableName: "Phase10",
    });
  });

  test("saveGame error", () => {
    const dynamo = {
      put: fnErrorReq(new Error("error")),
    };
    const game = new GameRepository(dynamo);
    expect(game.save({})).rejects.toThrow("error");
  });
});
