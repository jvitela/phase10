const ValidationError = require("../entities/ValidationError");
const isValidName = /^[a-zA-Z0-9.!_ ]{3,}$/;
const MAX_PLAYERS = 6;

class PlayersRepository {
  constructor(gameRepository) {
    this.game = gameRepository;
  }

  async add(newPlayer) {
    if (!newPlayer.name || !isValidName.test(newPlayer.name)) {
      throw new ValidationError("invalid_name");
    }

    let game = await this.game.load();
    if (!game) {
      // Create a game if none exists
      game = this.game.create();
    } else if (game.state.activePlayer !== 0) {
      // Abort if a game is already started
      throw new ValidationError("game_already_started");
    }

    // Check if newPlayer is already registered
    const player = game.state.players.find(
      (player) => player.connectionId === newPlayer.connectionId
    );
    if (player) {
      return player;
    }

    if (game.state.players.length === MAX_PLAYERS) {
      throw new ValidationError("game_players_full");
    }

    newPlayer.color = game.state.players.length;
    game.state.players.push(newPlayer);
    await this.game.save(game);
    return newPlayer;
  }
}

PlayersRepository.MAX_PLAYERS = MAX_PLAYERS;
module.exports = PlayersRepository;
