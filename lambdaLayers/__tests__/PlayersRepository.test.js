const PlayersRepository = require("../phase10/repositories/PlayersRepository");
const Player = require("../phase10/entities/Player");
const ValidationError = require("../phase10/entities/ValidationError");
const { fnSuccess } = require("../TestUtils");

describe("PlayersRepository", () => {
  test("add error:invalid_name", () => {
    const players = new PlayersRepository();
    let rejects = expect(players.add(new Player())).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("invalid_name");

    rejects = expect(players.add(new Player("1a", "$$$"))).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("invalid_name");
  });

  test("add error:game_already_started", () => {
    const game = {
      load: fnSuccess({
        state: { activePlayer: 2 },
      }),
    };
    const players = new PlayersRepository(game);
    const player = new Player("1", "John Doe");
    const rejects = expect(players.add(player)).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("game_already_started");
  });

  test("add success: create game", async () => {
    const item = {
      state: {
        players: [],
      },
    };
    const game = {
      load: fnSuccess(),
      save: fnSuccess(),
      create: jest.fn(() => item),
    };
    const john = new Player("1", "John Doe");
    const players = new PlayersRepository(game);

    await players.add(john);
    expect(game.load.mock.calls.length).toBe(1);
    expect(game.create.mock.calls.length).toBe(1);
    expect(game.save.mock.calls.length).toBe(1);
    expect(item.state.players.length).toBe(1);
    expect(item.state.players[0]).toBe(john);
  });

  test("add success: update game", async () => {
    const john = new Player("1", "John Doe");
    const jane = new Player("2", "Jane Doe");

    const item = {
      state: {
        players: [john],
      },
    };
    const game = {
      load: fnSuccess(),
      save: fnSuccess(),
      create: jest.fn(() => item),
    };
    const players = new PlayersRepository(game);

    await players.add(jane);
    expect(game.load.mock.calls.length).toBe(1);
    expect(game.create.mock.calls.length).toBe(1);
    expect(game.save.mock.calls.length).toBe(1);
    expect(item.state.players.length).toBe(2);
    expect(item.state.players[0]).toBe(john);
    expect(item.state.players[1]).toBe(jane);
  });
});
