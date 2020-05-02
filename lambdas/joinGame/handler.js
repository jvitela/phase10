const Player = require("/opt/phase10/entities/Player");
const ValidationError = require("/opt/phase10/entities/ValidationError");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const GameRepository = require("/opt/phase10/repositories/GameRepository");
const PlayersRepository = require("/opt/phase10/repositories/PlayersRepository");

// TODO:
//  Move Player and PlayersRepository to lambda
async function joinGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const player = new Player(connectionId, body.payload.name);
  const game = new GameRepository(dynamoDB);
  const players = new PlayersRepository(game);

  try {
    await game.load();
    const color = await players.add(player);
    await playerJoinedGame(apigwManagementApi, color, game.state.players);
    await game.save();
    return new ResponseAction(201, "joinGameSuccess", {
      ...game.state,
      color,
    });
  } catch (err) {
    return new ResponseAction(
      err instanceof ValidationError ? 400 : 500,
      "joinGameError",
      err.message
    );
  }
}

async function playerJoinedGame(apigwManagementApi, color, currentPlayers) {
  const newPlayer = currentPlayers[color];
  const message = JSON.stringify({
    action: "playerJoinedGame",
    payload: {
      name: newPlayer.name,
      color,
    },
  });
  const results = currentPlayers.map(async (player, idx) => {
    try {
      if (player.id !== null && color !== idx) {
        await apigwManagementApi
          .postToConnection({
            ConnectionId: player.id,
            Data: message,
          })
          .promise();
      }
    } catch (err) {
      if (err.statusCode === 410) {
        player.id = null;
      }
    }
  });
  return Promise.all(results);
}

module.exports = {
  joinGame,
  playerJoinedGame,
};
