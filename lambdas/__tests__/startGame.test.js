const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const board = require("/opt/phase10/entities/Board");
const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const startGame = require("../startGame/handler");

expect.extend({
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
  toBeOneOf(received, items) {
    const pass = items.includes(received);
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be one of (${items.join(", ")})`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be one of (${items.join(", ")})`,
        pass: false,
      };
    }
  },
});

describe("startGame", () => {
  test("Does nothing if player id is not found", async () => {
    const event = {
      requestContext: {
        connectionId: "123",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [{ id: "1a", name: "Jane Doe" }],
          }),
        },
      }),
    };
    const apigwManagementApi = {
      postToConnection: fnErrorReq(),
    };
    const response = await startGame(dynamoDB, apigwManagementApi, event);
    expect(dynamoDB.get.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(400, "startGameError", "Player not found")
    );
  });

  test("Updates the state of the player", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [{ id: "1a", name: "Jane Doe", isReady: false }],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnErrorReq(),
    };
    const response = await startGame(dynamoDB, apigwManagementApi, event);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
    expect(dynamoDB.get.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls[0][0]).toMatchObject({
      Item: {
        state: JSON.stringify({
          players: [{ id: "1a", name: "Jane Doe", isReady: true }],
        }),
      },
    });
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(new ResponseAction(200, "startGameSuccess"));
  });

  test("Sends playerReady message to all other players", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [
              { id: "1a", name: "Player01", isReady: false },
              { id: "1b", name: "Player02", isReady: false },
              { id: "1c", name: "Player03", isReady: false },
            ],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    await startGame(dynamoDB, apigwManagementApi, event);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(2);

    const data = JSON.stringify({
      action: "playerReady",
      payload: {
        name: "Player01",
        color: 0,
      },
    });
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: "1b",
      Data: data,
    });
    expect(apigwManagementApi.postToConnection.mock.calls[1][0]).toEqual({
      ConnectionId: "1c",
      Data: data,
    });
  });

  test("Updates the state for disconnected players", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [
              { id: "1a", name: "Player01", isReady: false },
              { id: "1b", name: "Player02", isReady: false },
              { id: "1c", name: "Player03", isReady: true },
            ],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnErrorReq({ statusCode: 410, message: "Test" }),
    };
    await startGame(dynamoDB, apigwManagementApi, event);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(2);
    expect(dynamoDB.put.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls[0][0]).toMatchObject({
      Item: {
        state: JSON.stringify({
          players: [
            { id: "1a", name: "Player01", isReady: true },
            { id: null, name: "Player02", isReady: false },
            { id: null, name: "Player03", isReady: false },
          ],
        }),
      },
    });
  });

  test("Sends startTurn message to all players", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            dices: [1, 2],
            players: [
              {
                id: "1a",
                name: "Player01",
                isReady: false,
                boardPosition: 0,
                cards: [],
              },
              {
                id: "1b",
                name: "Player02",
                isReady: true,
                boardPosition: 0,
                cards: [],
              },
            ],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    await startGame(dynamoDB, apigwManagementApi, event);

    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(2);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toMatchObject({
      ConnectionId: "1a",
      Data: expect.any(String),
    });
    expect(apigwManagementApi.postToConnection.mock.calls[1][0]).toEqual({
      ConnectionId: "1b",
      Data: expect.any(String),
    });
    expect(
      JSON.parse(apigwManagementApi.postToConnection.mock.calls[0][0].Data)
    ).toMatchObject({
      action: "startTurn",
      payload: expect.objectContaining({
        color: expect.toBeWithinRange(0, 1),
        dices: expect.arrayContaining([
          expect.toBeWithinRange(1, 6),
          expect.toBeWithinRange(1, 6),
        ]),
        options: expect.arrayContaining([
          expect.objectContaining({
            boardPosition: expect.toBeWithinRange(0, board.length),
            action: expect.toBeOneOf(Object.values(board.actions)),
          }),
          expect.objectContaining({
            boardPosition: expect.toBeWithinRange(0, board.length),
            action: expect.toBeOneOf(Object.values(board.actions)),
          }),
        ]),
        cards: expect.arrayContaining([
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
          expect.toBeWithinRange(0, 48),
        ]),
      }),
    });
  });
});
