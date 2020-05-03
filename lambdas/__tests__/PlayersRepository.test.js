const PlayersRepository = require("../joinGame/repositories/PlayersRepository");
const Player = require("/opt/phase10/entities/Player");
const ValidationError = require("/opt/phase10/entities/ValidationError");

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
  test("fails if the name is invalid", async () => {
    const game = { state: {} };
    const players = new PlayersRepository(game);

    // Name is missing
    let rejects = expect(players.add(new Player())).rejects;
    await Promise.all([
      rejects.toBeInstanceOf(ValidationError),
      rejects.toThrow("invalid_name"),
    ]);

    // Name has invalid characters
    rejects = expect(players.add(new Player("1a", "a$b%"))).rejects;
    await Promise.all([
      rejects.toBeInstanceOf(ValidationError),
      rejects.toThrow("invalid_name"),
    ]);

    // Name is too short (min 3)
    rejects = expect(players.add(new Player("1a", "Aa"))).rejects;
    await Promise.all([
      rejects.toBeInstanceOf(ValidationError),
      rejects.toThrow("invalid_name"),
    ]);

    // Name is too long (max 15)
    rejects = expect(players.add(new Player("1a", "abcdefghijklmnop"))).rejects;
    await Promise.all([
      rejects.toBeInstanceOf(ValidationError),
      rejects.toThrow("invalid_name"),
    ]);
  });

  test("fails if a game has already started and there are not free slots", async () => {
    const game = {
      state: {
        activePlayer: "b",
        players: [new Player("a", "One", 0), new Player("b", "Two", 1)],
      },
    };
    const players = new PlayersRepository(game);
    const player = new Player(3, "John Doe");
    const rejects = expect(players.add(player)).rejects;
    await Promise.all([
      rejects.toBeInstanceOf(ValidationError),
      rejects.toThrow("game_already_started"),
    ]);
  });

  test("fails if the game is full", async () => {
    const players = [];
    for (let i = 0; i < PlayersRepository.MAX_PLAYERS; ++i) {
      players.push(new Player(`p-${i}`, `Player ${i + 1}`, i));
    }
    const game = {
      state: { players, activePlayer: null },
    };
    const repo = new PlayersRepository(game);
    const player = new Player("x", "John Doe");
    const rejects = expect(repo.add(player)).rejects;
    await Promise.all([
      rejects.toBeInstanceOf(ValidationError),
      rejects.toThrow("game_players_full"),
    ]);
  });

  test("ignore when player joined aready", async () => {
    const john = new Player("1", "John Doe", 0);
    const game = {
      state: {
        players: [{ ...john }],
        activePlayer: null,
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
        activePlayer: null,
      },
    };
    const john = new Player("1", "John Doe");
    const players = new PlayersRepository(game);

    await players.add(john);
    expect(game.state.players.length).toBe(1);
    expect(game.state.players[0]).toBe(john);
  });

  test("add extra player", async () => {
    const john = new Player("a", "John Doe", 0);
    const jane = new Player("b", "Jane Doe", 1);

    const game = {
      state: {
        players: [john, jane],
        activePlayer: null,
      },
    };

    const players = new PlayersRepository(game);
    const max = new Player("c", "Max Mustermann");
    await players.add(max);
    expect(game.state.players.length).toBe(3);
    expect(game.state.players[0]).toBe(john);
    expect(game.state.players[1]).toBe(jane);
    expect(game.state.players[2]).toBe(max);
  });

  test("reuse unique slot of abandoned player", async () => {
    const john = new Player("a", "John", 0);
    const juan = new Player(null, "Juan", 1);
    const jane = new Player("c", "Jane", 2);

    // Juan is disconnected
    const game = {
      state: {
        players: [john, juan, jane],
        activePlayer: "a",
      },
    };

    // We add a new player named Max
    const players = new PlayersRepository(game);
    const max = new Player("d", "Max");
    const color = await players.add(max);

    expect(game.state.players.length).toBe(3);
    expect(game.state.players[0]).toBe(john);
    expect(game.state.players[1]).toBe(max);
    expect(game.state.players[2]).toBe(jane);
    expect(color).toBe(1);
  });

  test("reuse slot of abandoned player with same name", async () => {
    const playerA = new Player("a", "Aaaa", 0);
    const playerB = new Player(null, "Bbbb", 1);
    const playerC = new Player(null, "Cccc", 2);
    const playerD = new Player("d", "Dddd", 3);

    // Juan is disconnected
    const game = {
      state: {
        players: [playerA, playerB, playerC, playerD],
        activePlayer: "a",
      },
    };

    // We add a new player named Max
    const players = new PlayersRepository(game);
    const playerC2 = new Player("c2", "Cccc");
    const color = await players.add(playerC2);

    expect(game.state.players.length).toBe(4);
    expect(game.state.players[0]).toBe(playerA);
    expect(game.state.players[1]).toBe(playerB);
    expect(game.state.players[2]).toBe(playerC2);
    expect(game.state.players[3]).toBe(playerD);
    expect(color).toBe(2);
  });
});
