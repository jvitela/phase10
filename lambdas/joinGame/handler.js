const Player = require("/opt/phase10/entities/Player");
const ValidationError = require("/opt/phase10/entities/ValidationError");
const ResponseAction = require("/opt/phase10/entities/ResponseAction");
const GameRepository = require("/opt/phase10/repositories/GameRepository");
const PlayersRepository = require("./repositories/PlayersRepository");
const ConnectionsRepository = require("/opt/phase10/repositories/ConnectionsRepository");

// TODO:
//  Move Player and PlayersRepository to lambda
async function joinGame(dynamoDB, apigwManagementApi, event) {
  const connectionId = event.requestContext.connectionId;
  const body = JSON.parse(event.body);
  const player = new Player(connectionId, body.payload.name);
  const game = new GameRepository(dynamoDB);
  const players = new PlayersRepository(game);
  const comms = new ConnectionsRepository(apigwManagementApi);

  try {
    await game.load();
    const color = await players.add(player);
    const otherPlayers = game.state.players.filter((_, clr) => clr !== color);
    await comms.postToAll(otherPlayers, {
      action: "playerJoinedGame",
      payload: {
        player: players.getPlayerInfo(color),
        color,
      },
    });
    await game.save();
    return new ResponseAction(201, "joinGameSuccess", {
      ...game.state,
      players: players.getActivePlayers(color),
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

module.exports = joinGame;
