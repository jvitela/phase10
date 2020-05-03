const GameRepository = require("/opt/phase10/repositories/GameRepository");
const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");

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
    expect(game.state).toBe(null);
  });
});

describe("GameRepository::load", () => {
  test("returns new state when no previous game exists", async () => {
    const dynamo = {
      get: fnSuccessReq(),
    };
    const game = new GameRepository(dynamo);
    await game.load();
    expect(game.state).toEqual(game.getInitialState());
  });

  test("returns state of existing game", async () => {
    const dynamo = {
      get: fnSuccessReq({
        Item: {
          state: '{"foo":"bar"}',
        },
      }),
    };
    const game = new GameRepository(dynamo);
    await game.load();
    expect(game.state).toEqual({ foo: "bar" });
  });

  test("throws error from dynamoDB if cannot read game", () => {
    const dynamo = {
      get: fnErrorReq(new Error("error")),
    };
    const game = new GameRepository(dynamo);
    expect(game.load()).rejects.toThrow("error");
  });
});

describe("GameRepository::save", () => {
  test("saves the game to dynamoDB", () => {
    const dynamo = {
      put: fnSuccessReq(),
    };
    const game = new GameRepository(dynamo);
    game.state = { foo: "bar" };
    expect(() => game.save()).not.toThrow();
    expect(dynamo.put.mock.calls.length).toEqual(1); // Check dynamo.putItem was called once
    expect(dynamo.put.mock.calls[0].length).toEqual(1); // To be called with one param
    expect(dynamo.put.mock.calls[0][0]).toMatchObject({
      // First param was the serialized object
      Item: {
        gameId: "default",
        state: JSON.stringify(game.state),
      },
      TableName: "Phase10",
    });
  });

  test("throws error from dynamoDB if cannot save the game", () => {
    const dynamo = {
      put: fnErrorReq(new Error("error")),
    };
    const game = new GameRepository(dynamo);
    expect(game.save({})).rejects.toThrow("error");
  });
});
