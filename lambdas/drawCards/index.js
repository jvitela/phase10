const AWS = require("aws-sdk");
const drawCards = require("./handler");

AWS.config.update({ region: process.env.AWS_REGION });
const dynamoDB = new AWS.DynamoDB.DocumentClient({ apiVersion: "2012-08-10" });

exports.handler = async function handler(event) {
  const apigwManagementApi = new AWS.ApiGatewayManagementApi({
    apiVersion: "2018-11-29",
    endpoint:
      event.requestContext.domainName + "/" + event.requestContext.stage,
  });

  const response = await drawCards(dynamoDB, apigwManagementApi, event);
  return response;
};
