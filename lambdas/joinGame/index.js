const AWS = require("aws-sdk");
// const Player = require("/opt/phase10/entities/Player");
// const ValidationError = require("/opt/phase10/entities/ValidationError");
// const ResponseAction = require("/opt/phase10/entities/ResponseAction");
// const GameRepository = require("/opt/phase10/repositories/GameRepository");
// const PlayersRepository = require("/opt/phase10/repositories/PlayersRepository");
const { joinGame } = require("./handler");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

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
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const response = await joinGame(dynamoDB, apigwManagementApi, event);
  return response;
};
