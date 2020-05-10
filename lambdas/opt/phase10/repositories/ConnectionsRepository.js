class ConnectionsRepository {
  constructor(apigwManagementApi) {
    this.apigwManagementApi = apigwManagementApi;
  }

  async postToAll(connections, message) {
    const data = JSON.stringify(message);
    let hasErrors = false;
    const results = connections.map(async (connection) => {
      try {
        if (connection.id !== null) {
          await this.apigwManagementApi
            .postToConnection({
              ConnectionId: connection.id,
              Data: data,
            })
            .promise();
        }
      } catch (err) {
        if (err.statusCode === 410) {
          connection.id = null;
          connection.isReady = false;
          hasErrors = true;
        } else {
          throw err;
        }
      }
    });

    await Promise.all(results);

    return hasErrors;
  }
}

module.exports = ConnectionsRepository;
