const GameRepository = require("/opt/phase10/repositories/GameRepository");

async function leaveGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const game = new GameRepository(dynamoDB);

  try {
    await game.load();
    const player = game.state.players.find(
      (player) => player.connectionId === connectionId
    );

    if (player) {
      player.connectionId = null;
      await playerLeftGame(apigwManagementApi, player, game.state.players);
      await game.save();
      console.log("Player disconnected");
    }
  } catch (err) {
    console.error(err);
  }
}

async function playerLeftGame(apigwManagementApi, player, currentPlayers) {
  const message = JSON.stringify({
    action: "playerLeftGame",
    payload: {
      name: player.name,
      color: player.color,
    },
  });
  const results = currentPlayers.map(async (player) => {
    try {
      if (player.connectionId !== null) {
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

module.exports = leaveGame;
