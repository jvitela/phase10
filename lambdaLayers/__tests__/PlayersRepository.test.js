const PlayersRepository = require("../phase10/repositories/PlayersRepository");
const Player = require("../phase10/entities/Player");
const ValidationError = require("../phase10/entities/ValidationError");
const { fnSuccess } = require("../TestUtils");

describe("PlayersRepository", () => {
  test("export", () => {
    expect(PlayersRepository).toBeInstanceOf(Function);
  });

  test("constructor", () => {
    const game = {};
    const players = new PlayersRepository(game);
    expect(players).toBeInstanceOf(PlayersRepository);
  });

  test("properties", () => {
    const game = {};
    const players = new PlayersRepository(game);
    expect(players.game).toBe(game);
  });
});

describe("PlayersRepository::add", () => {
  test("fails if the name is invalid", () => {
    const game = { state: {} };
    const players = new PlayersRepository(game);
    let rejects = expect(players.add(new Player())).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("invalid_name");

    rejects = expect(players.add(new Player("1a", "$$$"))).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("invalid_name");
  });

  test("fails if a game has already started", () => {
    const game = {
      state: { activePlayer: 2 },
    };
    const players = new PlayersRepository(game);
    const player = new Player("1", "John Doe");
    const rejects = expect(players.add(player)).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("game_already_started");
  });

  test("fails if the game is full", () => {
    const players = [];
    for (let i = 1; i <= PlayersRepository.MAX_PLAYERS; ++i) {
      players.push(new Player(`p-${i}`, `Player ${i}`));
    }
    const game = {
      state: { players, activePlayer: 0 },
    };
    const repo = new PlayersRepository(game);
    const player = new Player("x", "John Doe");
    const rejects = expect(repo.add(player)).rejects;
    rejects.toBeInstanceOf(ValidationError);
    rejects.toThrow("game_players_full");
  });

  test("ignore when player joined aready", async () => {
    const john = new Player("1", "John Doe", 0);
    const game = {
      state: {
        players: [{ ...john }],
        activePlayer: 0,
      },
    };

    const players = new PlayersRepository(game);
    await players.add(john);
    expect(game.state.players.length).toBe(1);
    expect(game.state.players[0]).toEqual(john);
  });

  test("add first player", async () => {
    const game = {
      state: {
        players: [],
        activePlayer: 0,
      },
    };
    const john = new Player("1", "John Doe");
    const players = new PlayersRepository(game);

    await players.add(john);
    expect(game.state.players.length).toBe(1);
    expect(game.state.players[0]).toBe(john);
    expect(game.state.players[0].color).toBe(0);
  });

  test("add extra player", async () => {
    const john = new Player("a", "John Doe", 0);
    const jane = new Player("b", "Jane Doe", 1);

    const game = {
      state: {
        players: [john, jane],
        activePlayer: 0,
      },
    };

    const players = new PlayersRepository(game);
    const max = new Player("c", "Max Mustermann");
    await players.add(max);
    expect(game.state.players.length).toBe(3);
    expect(game.state.players[0]).toBe(john);
    expect(game.state.players[1]).toBe(jane);
    expect(game.state.players[2]).toBe(max);
    expect(game.state.players[2].color).toBe(2);
  });
});
