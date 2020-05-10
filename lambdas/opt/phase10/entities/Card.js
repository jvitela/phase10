const _toInteger = require("lodash.tointeger");
const { RED, GREEN, BLUE, YELLOW } = require("/opt/phase10/entities/Colors");
const MAX_CARDS_PER_COLOR = 12;

const cardsColors = [RED, GREEN, BLUE, YELLOW];
const getCardColor = (idx) => cardsColors[idx % cardsColors.length];
/**
 * @param {int} idx
 *  0-11:  RED
 *  12-23: GREEN
 *  24-35: BLUE
 *  36-47: YELLOW
 */
const getCard = (idx) => {
  const colorIdx = _toInteger(idx / MAX_CARDS_PER_COLOR);
  const color = getCardColor(colorIdx);
  const number = idx + 1 - colorIdx * MAX_CARDS_PER_COLOR;
  return { color, number };
};

module.exports = getCard;
