const ValidationError = require("../entities/ValidationError");
const isValidName = /^[a-zA-Z0-9.!_ ]{3,15}$/;
const MAX_PLAYERS = 6;

class PlayersRepository {
  constructor(gameRepository) {
    this.game = gameRepository;
  }

  async add(newPlayer) {
    if (!newPlayer.name || !isValidName.test(newPlayer.name)) {
      throw new ValidationError("invalid_name");
    }

    const state = this.game.state;

    // Check if player is already in the list
    const hasPlayer = state.players.find(
      (player) => player.connectionId === newPlayer.connectionId
    );
    if (hasPlayer) {
      return;
    }

    // Check if there is a free spot
    const freeIdx = state.players.findIndex(
      (player) => player.connectionId === null
    );

    if (freeIdx === -1 && state.activePlayer !== null) {
      // Abort if a game is already started
      //  and there are no abandoned players
      throw new ValidationError("game_already_started");
    }

    if (freeIdx !== -1) {
      // Take free spot
      newPlayer.color = freeIdx;
      state.players[freeIdx] = newPlayer;
    } else if (state.players.length < MAX_PLAYERS) {
      // Add new player
      newPlayer.color = state.players.length;
      state.players.push(newPlayer);
    } else {
      throw new ValidationError("game_players_full");
    }
  }
}

PlayersRepository.MAX_PLAYERS = MAX_PLAYERS;
module.exports = PlayersRepository;
