const ValidationError = require("/opt/phase10/entities/ValidationError");
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
    const color = state.players.findIndex(
      (player) => player.id === newPlayer.id
    );
    if (color !== -1) {
      return color;
    }

    // Check if there is a free spot, prefers spots with same name as new player
    let freeIdx = findFreeSlot(newPlayer.name, state.players);

    if (freeIdx === -1 && state.activePlayer !== null) {
      // Abort if a game is already started
      //  and there are no abandoned players
      throw new ValidationError("game_already_started");
    }

    if (freeIdx !== -1) {
      // Take free spot
      state.players[freeIdx] = newPlayer;
      return freeIdx;
    } else if (state.players.length < MAX_PLAYERS) {
      // Add new player
      state.players.push(newPlayer);
      return state.players.length - 1;
    } else {
      throw new ValidationError("game_players_full");
    }
  }

  map(iterator) {
    return this.game.state.players.map(iterator);
  }

  getPlayerInfo(color) {
    const player = this.game.state.players[color];
    return {
      name: player.name,
      phase: player.phase,
      boardPosition: player.boardPosition,
      collections: player.collections,
    };
  }

  getActivePlayers(activeColor) {
    return this.game.state.players.reduce((acc, player, color) => {
      if (player.id) {
        acc[color] = activeColor === color ? player : this.getPlayerInfo(color);
      }
      return acc;
    }, []);
  }
}

function findFreeSlot(newPlayerName, players) {
  let freeIdx = -1;
  players.forEach((player, idx) => {
    if (
      player.id === null &&
      (freeIdx === -1 || player.name === newPlayerName)
    ) {
      freeIdx = idx;
    }
  });
  return freeIdx;
}

PlayersRepository.MAX_PLAYERS = MAX_PLAYERS;
module.exports = PlayersRepository;
