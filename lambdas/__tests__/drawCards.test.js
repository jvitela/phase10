const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const board = require("/opt/phase10/entities/Board");
const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const drawCards = require("../drawCards/handler");

const { ANY, DRAW1, DRAW2, DRAW3 } = board.actions;

describe("drawCards", () => {
  test("Returns statusCode 500 on server error", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
      }),
    };
    const dynamoDB = {
      get: fnErrorReq(new Error("Test error")),
    };
    const response = await drawCards(dynamoDB, null, event);
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(500, "drawCardsError", "Test error")
    );
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 400 if requester is not the active player", async () => {
    const event = {
      requestContext: {
        connectionId: "1b",
      },
      body: JSON.stringify({
        action: "drawCards",
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            state: "PLAY_TURN",
            players: [
              { id: "1a", name: "Jane Doe" },
              { id: "1b", name: "John Doe" },
            ],
          }),
        },
      }),
    };
    const response1 = await drawCards(dynamoDB, null, event);
    const response2 = await drawCards(dynamoDB, null, {
      ...event,
      connectionId: "123",
    });
    const expectedResponse = new ResponseAction(
      400,
      "drawCardsError",
      "Not Players turn"
    );
    expect(dynamoDB.get).toHaveBeenCalledTimes(2);
    expect(response1).toBeInstanceOf(ResponseAction);
    expect(response2).toBeInstanceOf(ResponseAction);
    expect(response1).toEqual(expectedResponse);
    expect(response2).toEqual(expectedResponse);
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 400 if the game hasn't started", async () => {
    const event = {
      requestContext: {
        connectionId: "1b",
      },
      body: JSON.stringify({
        action: "drawCards",
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: null,
            players: [],
          }),
        },
      }),
    };
    const response = await drawCards(dynamoDB, null, event);
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(400, "drawCardsError", "Invalid state")
    );
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 400 if the selected action doesn't match", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { option: 0, stacks: [0] },
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            state: "PLAY_TURN",
            players: [
              { id: "1a", name: "Jane Doe", boardPosition: 0 },
              { id: "1b", name: "John Doe", boardPosition: 0 },
            ],
            options: [
              { boardPosition: 0, action: -1 },
              { boardPosition: 0, action: DRAW1 },
            ],
            stacks: {
              available: [],
              discarded: [],
            },
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const response = await drawCards(dynamoDB, null, event);
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(400, "drawCardsError", "Invalid action")
    );
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 400 if the given option is invalid", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { option: -1, stacks: [0] },
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            state: "PLAY_TURN",
            players: [
              { id: "1a", name: "Jane Doe", boardPosition: 0 },
              { id: "1b", name: "John Doe", boardPosition: 0 },
            ],
            options: [
              { boardPosition: 0, action: DRAW1 },
              { boardPosition: 0, action: DRAW1 },
            ],
            stacks: {
              available: [],
              discarded: [],
            },
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const response = await drawCards(dynamoDB, null, event);
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(400, "drawCardsError", "Invalid option")
    );
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 400 if one of the selected stacks is invalid", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { option: 0, stacks: [-1] },
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            state: "PLAY_TURN",
            players: [
              { id: "1a", name: "Jane Doe", boardPosition: 0 },
              { id: "1b", name: "John Doe", boardPosition: 0 },
            ],
            options: [
              { boardPosition: 0, action: DRAW1 },
              { boardPosition: 0, action: DRAW1 },
            ],
            stacks: {
              available: [],
              discarded: [],
            },
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const response = await drawCards(dynamoDB, null, event);
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(
      new ResponseAction(400, "drawCardsError", "Invalid stack -1")
    );
    expect(console.error).toHaveBeenCalled();
  });

  test("Returns statusCode 200 on Success", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { option: 0, stacks: [0, 1] },
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            state: "PLAY_TURN",
            players: [
              { id: "1a", name: "Jane Doe", boardPosition: 0, cards: [] },
              { id: "1b", name: "John Doe", boardPosition: 4, cards: [] },
            ],
            dices: [5, 6],
            options: [
              { boardPosition: 5, action: DRAW2 },
              { boardPosition: 6, action: DRAW1 },
            ],
            stacks: {
              available: [1, 2, 3],
              discarded: [4, 5, 6],
            },
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const response = await drawCards(dynamoDB, apigwManagementApi, event);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(new ResponseAction(200, "drawCardsSuccess"));
    expect(console.info).toHaveBeenCalled();
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(dynamoDB.put).toHaveBeenCalledTimes(1);
    expect(apigwManagementApi.postToConnection).toHaveBeenCalledTimes(1);
    expect(dynamoDB.put).toHaveBeenCalledWith({
      Item: expect.objectContaining({
        gameId: "default",
        state: expect.any(String),
        timestamp: expect.anything(),
      }),
      TableName: "Phase10",
    });
    expect(JSON.parse(dynamoDB.put.mock.calls[0][0].Item.state)).toMatchObject({
      state: "PLAY_TURN",
      selectedOption: 0,
      activePlayer: 0,
      players: [
        { id: "1a", name: "Jane Doe", boardPosition: 0, cards: [3, 6] },
        { id: "1b", name: "John Doe", boardPosition: 4, cards: [] },
      ],
      dices: [5, 6],
      options: [
        { boardPosition: 5, action: DRAW2 },
        { boardPosition: 6, action: DRAW1 },
      ],
      stacks: {
        available: [1, 2],
        discarded: [4, 5],
      },
    });
    expect(apigwManagementApi.postToConnection).toHaveBeenCalledWith({
      ConnectionId: "1a",
      Data: JSON.stringify({
        action: "drawCardsSuccess",
        payload: { cards: [3, 6], boardPosition: 5 },
      }),
    });
  });
});
