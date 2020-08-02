const _range = require("lodash.range");
const _random = require("lodash.random");
const _shuffle = require("lodash.shuffle");
const pickRandomPlayer = require("/opt/phase10/pickRandomPlayer");
const getOptions = require("/opt/phase10/getOptions");

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

  const dice1 = shuffleDice();
  const dice2 = shuffleDice();
  const activePlayer = pickRandomPlayer(players);
  const options = getOptions(activePlayer, players, dice1, dice2);

  return {
    players,
    stacks: {
      discarded,
      available,
    },
    dices: [dice1, dice2],
    options,
    activePlayer,
    numCardsDrawn: 0,
    selectedOption: 0,
    state: "BEGIN_TURN",
  };
}

const shuffleDeck = () => _shuffle([].concat(_range(48), _range(48)));

const shuffleDice = () => _random(1, 6);

module.exports = initializeGame;
