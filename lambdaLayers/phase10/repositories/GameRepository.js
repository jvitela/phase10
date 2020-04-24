const ValidationError = require("../entities/ValidationError");
const isValidName = /^[a-zA-Z0-9.!_ ]{3,}$/;

class GameRepository {
  constructor(dynamoDBDocumentClient, tableName = "Phase10") {
    this.db = dynamoDBDocumentClient;
    this.tableName = tableName;
  }

  create(gameId = "default") {
    return {
      gameId,
      timestamp: `${Date.now()}`,
      state: {
        stacks: {
          available: [],
          discarded: [],
        },
        dices: [],
        activePlayer: 0,
        players: [],
      },
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
      resp.Item.state = JSON.parse(resp.Item.state);
    }
    return resp.Item;
  }

  save({ gameId, timestamp, state }) {
    const request = {
      Item: {
        gameId,
        timestamp,
        state: JSON.stringify(state),
      },
      TableName: this.tableName,
    };
    return this.db.put(request).promise();
  }
}

module.exports = GameRepository;
