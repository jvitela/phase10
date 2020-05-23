const ResponseAction = require("/opt/phase10/entities/ResponseAction");
// const board = require("/opt/phase10/entities/Board");
const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const drawCards = require("../drawCards/handler");

describe("drawCards", () => {
  test("Returns statusCode 400 if requester is not the active player", async () => {
    const event = {
      requestContext: {
        connectionId: "1b",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { stacks: [0] },
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
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

  test("Returns statusCode 500 on server error", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { stacks: [0] },
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

  test("Returns statusCode 200 on Success", async () => {
    const event = {
      requestContext: {
        connectionId: "1a",
      },
      body: JSON.stringify({
        action: "drawCards",
        payload: { stacks: [0] },
      }),
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            activePlayer: 0,
            players: [
              { id: "1a", name: "Jane Doe" },
              { id: "1b", name: "John Doe" },
            ],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const response = await drawCards(dynamoDB, null, event);
    expect(dynamoDB.get).toHaveBeenCalledTimes(1);
    expect(response).toBeInstanceOf(ResponseAction);
    expect(response).toEqual(new ResponseAction(200, "drawCardsSuccess"));
    expect(console.info).toHaveBeenCalled();
  });
});
