const { fnSuccessReq, fnErrorReq } = require("/opt/TestUtils");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");

describe("ConnectionsRepository", () => {
  test("export", () => {
    expect(ConnectionsRepository).toBeInstanceOf(Function);
  });

  test("constructor", () => {
    const comms = new ConnectionsRepository();
    expect(comms).toBeInstanceOf(ConnectionsRepository);
  });

  test("properties", () => {
    const apigwManagementApi = {};
    const comms = new ConnectionsRepository(apigwManagementApi);
    expect(comms.apigwManagementApi).toBe(apigwManagementApi);
  });
});

describe("ConnectionsRepository::postToAll", () => {
  test("Ignores connections without id", async () => {
    const apigwManagementApi = {
      postToConnection: fnErrorReq(),
    };
    const connections = [{ id: null }, { id: null }];
    const comms = new ConnectionsRepository(apigwManagementApi);
    const errors = await comms.postToAll(connections, null);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(0);
    expect(errors).toBe(false);
  });

  test("Resets connections that failed with 410", async () => {
    const apigwManagementApi = {
      postToConnection: fnErrorReq({ statusCode: 410, message: "Gone" }),
    };
    const connections = [{ id: "1a" }];
    const comms = new ConnectionsRepository(apigwManagementApi);
    const errors = await comms.postToAll(connections, null);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(errors).toBe(true);
    expect(connections[0].id).toBeNull();
    expect(connections[0].isReady).toBe(false);
  });

  test("JSON encodes data sent to connections", async () => {
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const msg = { foo: "bar" };
    const connections = [{ id: "1a" }];
    const comms = new ConnectionsRepository(apigwManagementApi);
    const errors = await comms.postToAll(connections, msg);
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(1);
    expect(errors).toBe(false);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: "1a",
      Data: JSON.stringify(msg),
    });
  });

  test("Posts messages to all connections", async () => {
    const apigwManagementApi = {
      postToConnection: fnSuccessReq(),
    };
    const connections = [{ id: "1a" }, { id: "1b" }];
    const comms = new ConnectionsRepository(apigwManagementApi);
    const errors = await comms.postToAll(connections, "foo bar");
    expect(apigwManagementApi.postToConnection.mock.calls.length).toBe(2);
    expect(errors).toBe(false);
    expect(apigwManagementApi.postToConnection.mock.calls[0][0]).toEqual({
      ConnectionId: "1a",
      Data: '"foo bar"',
    });
    expect(apigwManagementApi.postToConnection.mock.calls[1][0]).toEqual({
      ConnectionId: "1b",
      Data: '"foo bar"',
    });
  });
});
