const {
  getColor,
  RED,
  BLUE,
  YELLOW,
  GREEN,
  WHITE,
  BLACK,
} = require("/opt/phase10/entities/Colors");

describe("getColor", () => {
  test("export", () => {
    expect(getColor).toBeInstanceOf(Function);
  });

  test("results", () => {
    expect(getColor(0)).toBe(RED);
    expect(getColor(1)).toBe(BLUE);
    expect(getColor(2)).toBe(YELLOW);
    expect(getColor(3)).toBe(GREEN);
    expect(getColor(4)).toBe(WHITE);
    expect(getColor(5)).toBe(BLACK);
  });
});
