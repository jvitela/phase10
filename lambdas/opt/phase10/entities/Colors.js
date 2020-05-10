const RED = Symbol("RED");
const BLUE = Symbol("BLUE");
const YELLOW = Symbol("YELLOW");
const GREEN = Symbol("GREEN");
const WHITE = Symbol("WHITE");
const BLACK = Symbol("BLACK");

const COLORS = [RED, BLUE, YELLOW, GREEN, WHITE, BLACK];
const getColor = (idx) => COLORS[idx % COLORS.length];

module.exports = {
  getColor,
  RED,
  BLUE,
  YELLOW,
  GREEN,
  WHITE,
  BLACK,
};
