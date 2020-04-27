const Player = require("/opt/phase10/entities/Player");
const ValidationError = require("/opt/phase10/entities/ValidationError");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const GameRepository = require("/opt/phase10/repositories/GameRepository");
const PlayersRepository = require("/opt/phase10/repositories/PlayersRepository");

async function joinGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const player = new Player(connectionId, body.payload.name);
  const game = new GameRepository(dynamoDB);
  const players = new PlayersRepository(game);

  try {
    await game.load();
    await players.add(player);
    await playerJoinedGame(apigwManagementApi, player, game.state.players);
    await game.save();
    return new ResponseAction(201, "joinGameSuccess", {
      game: game.state,
    });
  } catch (err) {
    return new ResponseAction(
      err instanceof ValidationError ? 400 : 500,
      "joinGameError",
      err.message
    );
  }
}

async function playerJoinedGame(apigwManagementApi, newPlayer, currentPlayers) {
  const message = JSON.stringify({
    action: "playerJoinedGame",
    payload: {
      name: newPlayer.name,
      color: newPlayer.color,
    },
  });
  const results = currentPlayers.map(async (player) => {
    try {
      if (
        player.connectionId !== null &&
        newPlayer.connectionId !== player.connectionId
      ) {
        await apigwManagementApi
          .postToConnection({
            ConnectionId: player.connectionId,
            Data: message,
          })
          .promise();
      }
    } catch (err) {
      if (err.statusCode === 410) {
        player.connectionId = null;
      }
    }
  });
  return Promise.all(results);
}

module.exports = {
  joinGame,
  playerJoinedGame,
};
