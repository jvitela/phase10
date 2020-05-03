const colorNames = ["Red", "Green", "Blue", "Yellow", "Black", "White"];

export function getColorName(color) {
  return color < colorNames.length ? colorNames[color] : null;
}
