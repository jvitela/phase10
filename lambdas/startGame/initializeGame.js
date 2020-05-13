const _range = require("lodash.range");
const _random = require("lodash.random");
const _shuffle = require("lodash.shuffle");

function initializeGame(currentPlayers = []) {
  const deck = shuffleDeck();
  const discarded = deck.slice(-5);
  let available = deck.slice(0, -5);

  // Assign cards to each player
  const players = currentPlayers.map((player) => {
    if (!player.isReady) {
      return player;
    }
    const cards = available.slice(-10);
    available = available.slice(0, -10);
    // Reset player
    return {
      ...player,
      phase: 1,
      boardPosition: 0,
      cards,
      collections: [],
    };
  });

  return {
    players,
    stacks: {
      discarded,
      available,
    },
    dices: [shuffleDice(), shuffleDice()],
    activePlayer: pickRandomPlayer(players),
  };
}

const shuffleDeck = () => _shuffle([].concat(_range(48), _range(48)));

const shuffleDice = () => _random(1, 6);

function pickRandomPlayer(players = []) {
  // Get the indexes for all the connected players.
  const colors = players.reduce((acc, player, color) => {
    if (player.isReady) {
      acc.push(color);
    }
    return acc;
  }, []);
  // pick a random index
  const idx = _random(0, colors.length - 1);
  return colors[idx];
}

module.exports = initializeGame;
