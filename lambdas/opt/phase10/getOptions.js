const board = require("entities/Board");

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

module.exports = getOptions;
