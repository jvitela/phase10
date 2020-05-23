const GameRepository = require("/opt/phase10/repositories/GameRepository");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const board = require("/opt/phase10/entities/Board");

/**
 * @param {AWS.DynamoDB.DocumentClient} dynamoDB
 * @param {AWS.ApiGatewayManagementApi} apigwManagementApi
 * @param {object} event The event object
 *    {
 *      "requestContext": {
 *        "connectionId": "123"
 *      },
 *      "body": "{\"action\":\"drawCards\",\"payload\":{\"stacks\":[0..1]}}"
 *    }
 * @returns
 *    {"statusCode":200, body:"{\"action\":\"drawCardsSuccess\",\"payload\":{\"cards\":[0..48]}"}
 *    {"statusCode":400, body:"{\"action\":\"drawCardsError\",\"payload\":\"...\"}"}
 *    {"statusCode":500, body:"{\"action\":\"drawCardsError\",\"payload\":\"...\"}"}
 */
async function drawCards(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);
  // const comms = new ConnectionsRepository(apigwManagementApi);
  try {
    const { payload } = JSON.parse(event.body);
    await game.load();
    const players = game.state.players;
    const color = players.findIndex((player) => player.id === connectionId);
    // Player sending the request is not the active player
    if (color === -1 || game.state.activePlayer !== color) {
      const errMsg = "Not Players turn";
      console.error(errMsg);
      return new ResponseAction(400, "drawCardsError", errMsg);
    }
    // const numCards = payload.cards.length;
    // switch (numCards) {
    //   case 1:
    //     if (game.state.activeActions)
    // }
    //   const otherPlayers = players.filter((player) => player.id !== connectionId);
    //   players[color].isReady = true;
    //   const pendingPlayers = otherPlayers.reduce(
    //     // do not count in player is disconnected or ready to start
    //     (acc, player) => acc + (player.id === null || player.isReady ? 0 : 1),
    //     0
    //   );
    //   if (pendingPlayers) {
    //     await comms.postToAll(otherPlayers, {
    //       action: "playerReady",
    //       payload: {
    //         name: players[color].name,
    //         color,
    //       },
    //     });
    //   } else if (otherPlayers.length > 0) {
    //     Object.assign(game.state, initializeGame(players));
    //     await comms.postToAll(game.state.players, (player) => ({
    //       action: "drawCardsSuccess",
    //       payload: {
    //         color: game.state.activePlayer,
    //         dices: game.state.dices,
    //         options: getOptions(game.state),
    //         cards: player.cards,
    //         lastDiscarded: game.state.stacks.discarded.slice(-1),
    //       },
    //     }));
    //   }
    await game.save();
    console.info(`Player #${color} drawed cards`);
    return new ResponseAction(200, "drawCardsSuccess");
  } catch (err) {
    console.error(err);
    return new ResponseAction(500, "drawCardsError", err.message);
  }
}

module.exports = drawCards;
