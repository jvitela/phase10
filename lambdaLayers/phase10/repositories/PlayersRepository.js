const ValidationError = require("../entities/ValidationError");
const isValidName = /^[a-zA-Z0-9.!_ ]{3,}$/;
const MAX_PLAYERS = 6;

class PlayersRepository {
  constructor(gameRepository) {
    this.game = gameRepository;

    if (!this.game.state) {
      this.game.load();
    }
  }

  async add(newPlayer) {
    if (!newPlayer.name || !isValidName.test(newPlayer.name)) {
      throw new ValidationError("invalid_name");
    }

    const state = this.game.state;
    if (state.activePlayer !== 0) {
      // Abort if a game is already started
      throw new ValidationError("game_already_started");
    }

    const hasPlayer = state.players.find(
      (player) => player.connectionId === newPlayer.connectionId
    );
    if (hasPlayer) {
      return;
    }

    if (state.players.length === MAX_PLAYERS) {
      const freeIdx = state.players.findIndex(
        (player) => player.connectionId === null
      );
      if (freeIdx === -1) {
        throw new ValidationError("game_players_full");
      }
      newPlayer.color = freeIdx;
      state.players[freeIdx] = newPlayer;
    } else {
      newPlayer.color = state.players.length;
      state.players.push(newPlayer);
    }
  }
}

PlayersRepository.MAX_PLAYERS = MAX_PLAYERS;
module.exports = PlayersRepository;
