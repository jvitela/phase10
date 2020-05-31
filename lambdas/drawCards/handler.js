const GameRepository = require("/opt/phase10/repositories/GameRepository");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");
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
  const comms = new ConnectionsRepository(apigwManagementApi);

  try {
    await game.load();
    const players = game.state.players;
    const color = players.findIndex((player) => player.id === connectionId);
    const { payload } = JSON.parse(event.body);

    validate(color, payload, game.state);

    const option = game.state.options[payload.option];
    const cards = drawCardsFromStacks(
      option.action,
      payload.stacks,
      game.state
    );

    players[color].cards = players[color].cards.concat(cards);
    game.state.selectedOption = payload.option;
    game.state.state = "PLAY_TURN";

    await game.save();

    await comms.postToAll(game.state.players, (player) => ({
      action: "drawCardsSuccess",
      payload:
        connectionId === player.id
          ? {
              color,
              cards,
              boardPosition: option.boardPosition,
            }
          : {
              color,
              option: payload.option,
              boardPosition: option.boardPosition,
            },
    }));

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
  if (state.state !== "PLAY_TURN" || state.activePlayer === null) {
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

/**
 * removes cards from the selected stacks
 *
 * @param {number} action
 * @param {array} stacksIds
 * @param {object} state
 *
 * @returns {array} the cards drawn
 */
function drawCardsFromStacks(action, stacksIds, state) {
  const stacks = [state.stacks.available, state.stacks.discarded];
  let max;
  switch (action) {
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
