const _range = require("lodash.range");
const _random = require("lodash.random");
const _shuffle = require("lodash.shuffle");
const board = require("/opt/phase10/entities/Board");

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
    state: "BEGIN_TURN",
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

function getOptions(activePlayer, players, dice1, dice2) {
  const playersBoardPositions = players
    .filter((player) => player.isReady)
    .map((player) => player.boardPosition);

  const boardPosition = players[activePlayer].boardPosition;
  return [
    findFreeBoardPosition(dice1, boardPosition, playersBoardPositions),
    findFreeBoardPosition(
      dice1 === dice2 ? 2 * dice2 : dice2,
      boardPosition,
      playersBoardPositions
    ),
  ];
}

function findFreeBoardPosition(steps, boardPosition, playersBoardPositions) {
  for (let count = 1; count <= steps; ) {
    boardPosition = ++boardPosition % board.length;
    // Count only the free board cells
    if (!playersBoardPositions.includes(boardPosition)) {
      ++count;
    }
  }

  return {
    boardPosition,
    action: board.getAction(boardPosition),
  };
}

module.exports = initializeGame;
