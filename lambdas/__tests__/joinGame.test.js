const Player = require("/opt/phase10/entities/Player");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const PlayersRepository = require("../joinGame/repositories/PlayersRepository");
const { joinGame, playerJoinedGame } = require("../joinGame/handler");

describe("playerJoinedGame", () => {
  test("Ignores new and disconnected players", async () => {
    const apigwManagementApi = {
      postToConnection: fnErrorReq(),
    };
    const game = {
      state: {
        players: [new Player(null, "John Doe"), new Player("1b", "Jane Doe")],
      },
    };
    const currentPlayers = new PlayersRepository(game);
    await playerJoinedGame(apigwManagementApi, 1, currentPlayers);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
  });

  test("when player disconnects, it resets its connectionId", async () => {
    const apigwManagementApi = {
      postToConnection: fnErrorReq({ statusCode: 410, message: "Gone" }),
    };
    const game = {
      state: {
        players: [new Player("1a", "John Doe"), new Player("1b", "Jane Doe")],
      },
    };
    const currentPlayers = new PlayersRepository(game);

    await playerJoinedGame(apigwManagementApi, 1, currentPlayers);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(game.state.players[0].id).toBeNull();
  });

  test("posts messages to other players", async () => {
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const game = {
      state: {
        players: [new Player("1a", "John Doe"), new Player("1b", "Jane Doe")],
      },
    };
    const currentPlayers = new PlayersRepository(game);

    await playerJoinedGame(apigwManagementApi, 1, currentPlayers);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: "1a",
      Data: JSON.stringify({
        action: "playerJoinedGame",
        payload: {
          player: {
            name: "Jane Doe",
            phase: 1,
            boardPosition: 0,
            collections: [],
          },
          color: 1,
        },
      }),
    });
    expect(game.state.players[0].id).not.toBeNull();
  });
});

describe("joinGame", () => {
  const event = {
    requestContext: {
      connectionId: "123",
    },
    body: JSON.stringify({
      payload: { name: "John Doe" },
    }),
  };

  test("returns ResponseAction with statusCode 500", async () => {
    const dynamoDB = {
      get: fnErrorReq(new Error("Test message")),
    };
    const apigwManagementApi = {};
    const response = await joinGame(dynamoDB, apigwManagementApi, event);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(500, "joinGameError", "Test message")
    );
  });

  test("returns ResponseAction with statusCode 400", async () => {
    const event = {
      requestContext: {
        connectionId: "123",
      },
      body: JSON.stringify({
        payload: {},
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({}),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {};
    const response = await joinGame(dynamoDB, apigwManagementApi, event);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(400, "joinGameError", "invalid_name")
    );
  });

  test("returns ResponseAction with statusCode 201", async () => {
    const dynamoDB = {
      get: fnSuccessReq({}), // new game
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const response = await joinGame(dynamoDB, apigwManagementApi, event);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(201, "joinGameSuccess", {
        stacks: {
          available: [],
          discarded: [],
        },
        dices: [],
        activePlayer: null,
        players: [new Player("123", "John Doe")],
        color: 0,
      })
    );
    expect(dynamoDB.get.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
  });
});
