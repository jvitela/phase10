const ValidationError = require("../entities/ValidationError");
const isValidName = /^[a-zA-Z0-9.!_ ]{3,}$/;

class PlayersRepository {
  constructor(gameRepository) {
    this.game = gameRepository;
  }

  async add(player) {
    if (!player.name || !isValidName.test(player.name)) {
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

    // Player already joined
    const playersIds = game.state.players.map((player) => player.connectionId);
    if (playersIds.includes(player.connectionId)) {
      return;
    }

    game.state.players.push(player);
    await this.game.save(game);
  }
}

module.exports = PlayersRepository;
