const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const leaveGame = require("../leaveGame/handler");

describe("leaveGame", () => {
  test("sets player id to null and isReady to false", async () => {
    const event = {
      requestContext: {
        connectionId: "123",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [{ id: "123", name: "Jane Doe", isReady: true }],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnErrorReq({ statusCode: 500 }),
    };
    // Jane leaves the game
    await leaveGame(dynamoDB, apigwManagementApi, event);
    // Reads and updates the state
    expect(dynamoDB.get.mock.calls.length).toBe(1);
    expect(dynamoDB.put.mock.calls.length).toBe(1);
    // Writes a new state
    const request = dynamoDB.put.mock.calls[0][0];
    expect(request).toMatchObject({
      Item: expect.objectContaining({
        state: JSON.stringify({
          players: [{ id: null, name: "Jane Doe", isReady: false }],
        }),
      }),
    });
  });

  test("Ignores disconnected players", async () => {
    const event = {
      requestContext: {
        connectionId: "123",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [
              { id: null, name: "John Doe" },
              { id: "123", name: "Jane Doe" },
            ],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnErrorReq({ statusCode: 500 }),
    };
    // Jane leaves the game
    await leaveGame(dynamoDB, apigwManagementApi, event);
    // Nobody is notified
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
  });

  test("notifies connected players", async () => {
    const event = {
      requestContext: {
        connectionId: "123",
      },
    };
    const dynamoDB = {
      get: fnSuccessReq({
        Item: {
          state: JSON.stringify({
            players: [
              { id: "321", name: "John Doe" },
              { id: "123", name: "Jane Doe" },
            ],
          }),
        },
      }),
      put: fnSuccessReq(),
    };
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    // Jane leaves the game
    await leaveGame(dynamoDB, apigwManagementApi, event);
    // John is notified
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toMatchObject({
      ConnectionId: "321",
      Data: JSON.stringify({
        action: "playerLeftGame",
        payload: {
          name: "Jane Doe",
          color: 1,
        },
      }),
    });
  });
});
