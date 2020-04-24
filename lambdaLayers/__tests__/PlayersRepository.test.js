const PlayersRepository = require("../phase10/repositories/PlayersRepository");
const Player = require("../phase10/entities/Player");
const ValidationError = require("../phase10/entities/ValidationError");
const { fnSuccess } = require("../TestUtils");

describe("PlayersRepository::add", () => {
  test("invalid name", () => {
    const players = new PlayersRepository();
    let rejects = expect(players.add(new Player())).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("invalid_name");

    rejects = expect(players.add(new Player("1a", "$$$"))).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("invalid_name");
  });

  test("game already started", () => {
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

  test("game is full", () => {
    const players = [];
    for (let i = 1; i <= PlayersRepository.MAX_PLAYERS; ++i) {
      players.push(new Player(`p-${i}`, `Player ${i}`));
    }
    const game = {
      load: fnSuccess({
        state: { players, activePlayer: 0 },
      }),
    };
    const repo = new PlayersRepository(game);
    const player = new Player("x", "John Doe");
    const rejects = expect(repo.add(player)).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("game_players_full");
  });

  test("player joined aready", async () => {
    const john = new Player("1", "John Doe");
    const item = {
      state: {
        players: [john],
        activePlayer: 0,
      },
    };
    const game = {
      load: fnSuccess(item),
      save: fnSuccess(),
      create: jest.fn(),
    };

    const players = new PlayersRepository(game);

    await players.add(john);
    expect(game.load.mock.calls.length).toBe(1);
    expect(game.create.mock.calls.length).toBe(0);
    expect(game.save.mock.calls.length).toBe(0);
    expect(item.state.players.length).toBe(1);
    expect(item.state.players[0]).toBe(john);
  });

  test("create game and add first player", async () => {
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

  test("add player and update game", async () => {
    const john = new Player("1", "John Doe");
    const jane = new Player("2", "Jane Doe");

    const item = {
      state: {
        players: [john],
        activePlayer: 0,
      },
    };
    const game = {
      load: fnSuccess(item),
      save: fnSuccess(),
      create: jest.fn(),
    };
    const players = new PlayersRepository(game);

    await players.add(jane);
    expect(game.load.mock.calls.length).toBe(1);
    expect(game.create.mock.calls.length).toBe(0);
    expect(game.save.mock.calls.length).toBe(1);
    expect(item.state.players.length).toBe(2);
    expect(item.state.players[0]).toBe(john);
    expect(item.state.players[1]).toBe(jane);
  });
});
