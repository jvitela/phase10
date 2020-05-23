class GameRepository {
  constructor(dynamoDBDocumentClient, tableName = "Phase10") {
    this.db = dynamoDBDocumentClient;
    this.tableName = tableName;
    this.state = null;
  }

  getInitialState() {
    return {
      stacks: {
        available: [],
        discarded: [],
      },
      dices: [],
      actions: [],
      activePlayer: null,
      players: [],
    };
  }

  async load() {
    const params = {
      Key: { gameId: "default" },
      TableName: this.tableName,
    };

    // If there is no matching item, getItem does not return any data and
    //  there will be no Item element in the response.
    const resp = await this.db.get(params).promise();

    if (resp && resp.Item && resp.Item.state) {
      // TODO: don't return data if timestamp is older than X hours
      this.state = JSON.parse(resp.Item.state);
    }

    if (!this.state) {
      this.state = this.getInitialState();
    }
  }

  async save() {
    const request = {
      Item: {
        gameId: "default",
        timestamp: Date.now(),
        state: JSON.stringify(this.state),
      },
      TableName: this.tableName,
    };
    return this.db.put(request).promise();
  }
}

module.exports = GameRepository;
