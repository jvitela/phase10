const Player = require("/opt/phase10/entities/Player");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const { fnSuccessReq, fnErrorReq } = require("TestUtils");
const { joinGame, playerJoinedGame } = require("../handler");

describe("playerJoinedGame", () => {
  test("Ignores new and disconnected players", async () => {
    const apigwManagementApi = {
      postToConnection: fnErrorReq(),
    };
    const currentPlayers = [
      new Player(null, "John Doe", 0), // disconnected player
    ];
    const newPlayer = new Player("1b", "Jane Doe", 1);
    await playerJoinedGame(apigwManagementApi, newPlayer, currentPlayers);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
  });

  test("when player disconnects, it resets its connectionId", async () => {
    const apigwManagementApi = {
      postToConnection: fnErrorReq({ statusCode: 410, message: "Gone" }),
    };
    const currentPlayers = [new Player("1a", "John Doe", 0)];
    const newPlayer = new Player("1b", "Jane Doe", 0);
    await playerJoinedGame(apigwManagementApi, newPlayer, currentPlayers);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(currentPlayers[0].connectionId).toBeNull();
  });

  test("posts messages to other players", async () => {
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const currentPlayers = [new Player("1a", "John Doe", 0)];
    const newPlayer = new Player("1b", "Jane Doe", 1);
    await playerJoinedGame(apigwManagementApi, newPlayer, currentPlayers);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: "1a",
      Data: JSON.stringify({
        action: "playerJoinedGame",
        payload: {
          name: "Jane Doe",
          color: 1,
        },
      }),
    });
    expect(currentPlayers[0].connectionId).not.toBeNull();
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
        game: {
          stacks: {
            available: [],
            discarded: [],
          },
          dices: [],
          activePlayer: 0,
          players: [new Player("123", "John Doe", 0)],
        },
      })
    );
    expect(dynamoDB.get.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
  });

  test("posts messages to other players", async () => {
    const john = new Player("1a", "John", 0);
    const jane = new Player("1b", "Jane", 1);
    const max = new Player("1c", "Max", 2);
    const anne = new Player("2a", "Anne");

    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            players: [john, jane, max],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const event = {
      requestContext: {
        connectionId: anne.connectionId,
      },
      body: JSON.stringify({
        payload: { name: anne.name },
      }),
    };
    const response = await joinGame(dynamoDB, apigwManagementApi, event);

    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(201, "joinGameSuccess", {
        game: {
          activePlayer: 0,
          players: [john, jane, max, { ...anne, color: 3 }],
        },
      })
    );
    expect(dynamoDB.get.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(3);
    const Data = JSON.stringify({
      action: "playerJoinedGame",
      payload: {
        name: anne.name,
        color: 3,
      },
    });
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: john.connectionId,
      Data,
    });
    expect(apigwManagementApi.postToConnection.mock.calls[1][0]).toEqual({
      ConnectionId: jane.connectionId,
      Data,
    });
    expect(apigwManagementApi.postToConnection.mock.calls[2][0]).toEqual({
      ConnectionId: max.connectionId,
      Data,
    });
  });
});