const GameRepository = require("/opt/phase10/repositories/GameRepository");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const board = require("/opt/phase10/entities/Board");
const initializeGame = require("./initializeGame");

/**
 * @param {AWS.DynamoDB.DocumentClient} dynamoDB
 * @param {AWS.ApiGatewayManagementApi} apigwManagementApi
 * @param {object} event The event object
 *    {
 *      "requestContext": {
 *        "connectionId": "123"
 *      },
 *      "body": "{\"action\":\"startGame\"}"
 *    }
 * @returns
 *    {"statusCode":400, body:"{\"action\":\"startGameError\",\"payload\":\"Player not found\"}"}
 *    {"statusCode":500, body:"{\"action\":\"startGameError\",\"payload\":\"...\"}"}
 *    {"statusCode":200, body:"{\"action\":\"startGameSuccess\"}"}
 */
async function startGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);
  const comms = new ConnectionsRepository(apigwManagementApi);

  try {
    await game.load();

    const players = game.state.players;
    const color = players.findIndex((player) => player.id === connectionId);
    const otherPlayers = players.filter((player) => player.id !== connectionId);

    // Abort if requester is not a registered player
    if (color === -1) {
      return new ResponseAction(400, "startGameError", "Player not found");
    }

    players[color].isReady = true;
    const pendingPlayers = otherPlayers.reduce(
      // do not count in player is disconnected or ready to start
      (acc, player) => acc + (player.id === null || player.isReady ? 0 : 1),
      0
    );

    if (pendingPlayers) {
      await comms.postToAll(otherPlayers, {
        action: "playerReady",
        payload: {
          name: players[color].name,
          color,
        },
      });
    } else if (otherPlayers.length > 0) {
      Object.assign(game.state, initializeGame(players));
      await comms.postToAll(game.state.players, (player) => ({
        action: "startGameSuccess",
        payload: {
          color: game.state.activePlayer,
          dices: game.state.dices,
          options: getOptions(game.state),
          cards: player.cards,
          lastDiscarded: game.state.stacks.discarded.slice(-1),
        },
      }));
    }

    await game.save();

    return new ResponseAction(200, "startGameSuccess");
  } catch (err) {
    console.error(err);
    return new ResponseAction(500, "startGameError", err.message);
  }
}

function getOptions(gameState) {
  const playersBoardPositions = gameState.players
    .filter((player) => player.isReady)
    .map((player) => player.boardPosition);

  const dices = gameState.dices;
  if (dices[0] === dices[1]) {
    dices[1] = dices[0] + dices[1];
  }

  return [
    findFreeBoardPosition(gameState, dices[0], playersBoardPositions),
    findFreeBoardPosition(gameState, dices[1], playersBoardPositions),
  ];
}

function findFreeBoardPosition(gameState, steps, playersBoardPositions) {
  const activePlayer = gameState.players[gameState.activePlayer];
  let boardPosition = activePlayer.boardPosition;

  for (let count = 1; count <= steps; ) {
    boardPosition = ++boardPosition % board.length;
    // Count only the free board cells
    if (!playersBoardPositions.includes(boardPosition)) {
      ++count;
    }
  }

  return {
    boardPosition,
    action: board.getAction(boardPosition),
  };
}

module.exports = startGame;
