const GameRepository = require("/opt/phase10/repositories/GameRepository");

async function leaveGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);

  try {
    await game.load();
    const color = game.state.players.findIndex(
      (player) => player.id === connectionId
    );

    if (color !== -1) {
      const player = game.state.players[color];
      player.id = null;
      await playerLeftGame(apigwManagementApi, color, game.state.players);
      await game.save();
      console.log("Player disconnected");
    }
  } catch (err) {
    console.error(err);
  }
}

async function playerLeftGame(apigwManagementApi, color, currentPlayers) {
  const player = currentPlayers[color];
  const message = JSON.stringify({
    action: "playerLeftGame",
    payload: {
      name: player.name,
      color,
    },
  });
  const results = currentPlayers.map(async (player) => {
    try {
      if (player.id !== null) {
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

module.exports = leaveGame;
