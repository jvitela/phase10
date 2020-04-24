const AWS = require("aws-sdk");
const Player = require("/opt/phase10/entities/Player");
const GameRepository = require("/opt/phase10/repositories/GameRepository");
const PlayersRepository = require("/opt/phase10/repositories/PlayersRepository");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamo = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

/*
  Route Selection Expression should be $request.body.action

  event: {
    requestContext: {
      connectionId: "123"
    },
    body: "{\"action\":\"joinGame\",\"payload\":{\"name\":\"John Doe\"}}"
  }
*/
exports.handler = async function handler(event) {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const player = new Player(connectionId, body.payload.name);
  const game = new GameRepository(dynamo);
  const players = new PlayersRepository(game);

  try {
    await players.add(player);
    return { statusCode: 200 };
  } catch (err) {
    return { statusCode: 500, body: err.message };
  }
};
