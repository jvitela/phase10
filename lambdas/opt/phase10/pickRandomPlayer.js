const _random = require("lodash.random");

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

module.exports = pickRandomPlayer;
