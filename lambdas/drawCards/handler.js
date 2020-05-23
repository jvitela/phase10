const GameRepository = require("/opt/phase10/repositories/GameRepository");
const ValidationError = require("/opt/phase10/entities/ValidationError");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const board = require("/opt/phase10/entities/Board");

const { ANY, DRAW1, DRAW2, DRAW3 } = board.actions;

/**
 * @param {AWS.DynamoDB.DocumentClient} dynamoDB
 * @param {AWS.ApiGatewayManagementApi} apigwManagementApi
 * @param {object} event The event object
 *    {
 *      "requestContext": {
 *        "connectionId": "123"
 *      },
 *      "body": "{\"action\":\"drawCards\",\"payload\":{\"option\":0,\"stacks\":[0..1]}}"
 *    }
 * @returns
 *    {"statusCode":200, body:"{\"action\":\"drawCardsSuccess\",\"payload\":{\"cards\":[0..48],\"boardPosition\":1}"}
 *    {"statusCode":400, body:"{\"action\":\"drawCardsError\",\"payload\":\"...\"}"}
 *    {"statusCode":500, body:"{\"action\":\"drawCardsError\",\"payload\":\"...\"}"}
 */
async function drawCards(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);
  // const comms = new ConnectionsRepository(apigwManagementApi);

  try {
    await game.load();
    const players = game.state.players;
    const color = players.findIndex((player) => player.id === connectionId);
    const { payload } = JSON.parse(event.body);

    validate(color, payload, game.state);

    const option = game.state.options[payload.option];
    const cards = mapCards(option, payload.stacks, game.state);

    players[color].cards = players[color].cards.concat(cards);

    await game.save();

    await apigwManagementApi
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify({
          action: "drawCardsSuccess",
          payload: { cards, boardPosition: option.boardPosition },
        }),
      })
      .promise();

    console.info(`Player #${color} drawed cards`);
    return new ResponseAction(200, "drawCardsSuccess");
  } catch (err) {
    console.error(err);
    return new ResponseAction(
      err instanceof ValidationError ? 400 : 500,
      "drawCardsError",
      err.message
    );
  }
}

function validate(color, payload, state) {
  if (state.activePlayer === null) {
    throw new ValidationError("Invalid state");
  }

  if (color === -1 || state.activePlayer !== color) {
    throw new ValidationError("Not Players turn");
  }

  if (payload.option < 0 || payload.option > state.options.length) {
    throw new ValidationError("Invalid option");
  }

  const stacks = [state.stacks.available, state.stacks.discarded];
  for (let i = 0; i < payload.stacks.length; ++i) {
    if (payload.stacks[i] < 0 || payload.stacks[i] > stacks.length) {
      throw new ValidationError(`Invalid stack ${payload.stacks[i]}`);
    }
  }

  const validActions = [DRAW1, DRAW2, DRAW3, ANY];
  const option = state.options[payload.option];
  if (!validActions.includes(option.action)) {
    throw new ValidationError("Invalid action");
  }
}

function mapCards(option, stacksIds, state) {
  const stacks = [state.stacks.available, state.stacks.discarded];
  let max;
  switch (option.action) {
    default:
    case DRAW1:
      max = 1;
    case DRAW2:
      max = 2;
    case DRAW3:
      max = 3;
    case ANY:
      max = 1 + (stacksIds.length % 3);
  }
  return stacksIds.slice(0, max).map((id) => stacks[id].pop());
}

module.exports = drawCards;
