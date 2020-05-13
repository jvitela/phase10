const GameRepository = require("/opt/phase10/repositories/GameRepository");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");

async function leaveGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);
  const comms = new ConnectionsRepository(apigwManagementApi);

  try {
    await game.load();
    const color = game.state.players.findIndex(
      (player) => player.id === connectionId
    );

    if (color !== -1) {
      const player = game.state.players[color];
      player.id = null;
      comms.postToAll(game.state.players, {
        action: "playerLeftGame",
        payload: {
          name: player.name,
          color,
        },
      });
      await game.save();
      console.log("Player disconnected");
    }
  } catch (err) {
    console.error(err);
  }
}

module.exports = leaveGame;
