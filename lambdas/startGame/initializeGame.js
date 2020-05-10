const _range = require("lodash.range");
const _random = require("lodash.random");
const _shuffle = require("lodash.shuffle");

function initializeGame(players = []) {
  const deck = shuffleDeck();
  return {
    stacks: {
      discarded: deck.slice(-5),
      available: deck.slice(0, -5),
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
    if (player.id !== null) {
      acc.push(color);
    }
    return acc;
  }, []);
  // pick a random index
  const idx = _random(0, colors.length - 1);
  return colors[idx];
}

module.exports = initializeGame;
