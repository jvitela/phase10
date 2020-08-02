const GameRepository = require("/opt/phase10/repositories/GameRepository");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");
const ValidationError = require("/opt/phase10/entities/ValidationError");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
// const board = require("/opt/phase10/entities/Board");
const pickRandomPlayer = require("/opt/phase10/pickRandomPlayer");
const getOptions = require("/opt/phase10/getOptions");

// const { ANY, DRAW1, DRAW2, DRAW3 } = board.actions;

/**
 * @param {AWS.DynamoDB.DocumentClient} dynamoDB
 * @param {AWS.ApiGatewayManagementApi} apigwManagementApi
 * @param {object} event The event object
 *    {
 *      "requestContext": {
 *        "connectionId": "123"
 *      },
 *      "body": "{\"action\":\"endTurn\",\"payload\":{\"discard\":[0..48],\"collections\":{}}}"
 *    }
 * @returns
 *    {"statusCode":200, body:"{\"action\":\"endTurnSuccess\",\"payload\":{...}}"}
 *    {"statusCode":400, body:"{\"action\":\"endTurnError\",\"payload\":\"...\"}"}
 *    {"statusCode":500, body:"{\"action\":\"endTurnError\",\"payload\":\"...\"}"}
 */
async function endTurn(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);
  const comms = new ConnectionsRepository(apigwManagementApi);

  try {
    await game.load();
    const players = game.state.players;
    const color = players.findIndex((player) => player.id === connectionId);
    const { payload } = JSON.parse(event.body);

    validate(color, payload, game.state);

    // Player can discard more than one card
    game.state.stacks.discarded = game.state.stacks.discarded.concat(
      payload.discard
    );
    // players[color];
    // game.state.selectedOption = payload.option;

    const dice1 = shuffleDice();
    const dice2 = shuffleDice();
    const activePlayer = pickRandomPlayer(players);
    const options = getOptions(activePlayer, players, dice1, dice2);

    game.state = {
      ...game.state,
      dices: [dice1, dice2],
      options,
      activePlayer,
      numCardsDrawn: 0,
      selectedOption: 0,
      state: "BEGIN_TURN",
    };

    await game.save();

    await comms.postToAll(game.state.players, (player) => ({
      action: "endTurnSuccess",
      payload: {
        color: game.state.activePlayer,
        dices: game.state.dices,
        options: game.state.options,
        cards: player.cards,
        discarded: payload.discard.slice(-1)[0],
      },
    }));

    // console.info(`Player #${color} drawed cards`);
    return new ResponseAction(200, "endTurnSuccess");
  } catch (err) {
    console.error(err);
    return new ResponseAction(
      err instanceof ValidationError ? 400 : 500,
      "endTurnError",
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

  if (!Array.isArray(payload.discard)) {
    throw new ValidationError("Invalid discard payload");
  }

  if (payload.discard.length !== state.numCardsDrawn) {
    throw new ValidationError("Incorrect number of discards");
  }
}

module.exports = endTurn;
