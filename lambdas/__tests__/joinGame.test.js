const Player = require("/opt/phase10/entities/Player");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const PlayersRepository = require("../joinGame/repositories/PlayersRepository");
const joinGame = require("../joinGame/handler");

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

  test("posts messages to other players", async () => {
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };

    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: null,
            players: [{ id: "1b", name: "Jane Doe", isReady: false }],
          }),
        },
      }),
      put: fnSuccessReq(),
    };

    const response = await joinGame(dynamoDB, apigwManagementApi, event);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toMatchObject({
      statusCode: 201,
    });
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: "1b",
      Data: JSON.stringify({
        action: "playerJoinedGame",
        payload: {
          player: {
            name: "John Doe",
            phase: 1,
            boardPosition: 0,
            collections: [],
          },
          color: 1,
        },
      }),
    });
  });
});
