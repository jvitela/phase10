const getCard = require("/opt/phase10/entities/Card");
const {
  RED,
  BLUE,
  YELLOW,
  GREEN,
  WHITE,
  BLACK,
} = require("/opt/phase10/entities/Colors");

describe("getCard", () => {
  test("export", () => {
    expect(getCard).toBeInstanceOf(Function);
  });

  test("returns an object with color and number props", () => {
    const colorsList = [RED, BLUE, YELLOW, GREEN, WHITE, BLACK];
    const card = getCard(0);
    expect(card).toMatchObject({
      number: expect.any(Number),
      color: expect.anything(),
    });
    expect(colorsList).toContain(card.color);
    expect(card.number).toBeGreaterThanOrEqual(1);
    expect(card.number).toBeLessThanOrEqual(12);
  });

  test("returs RED cards from 0 to 11", () => {
    expect(getCard(0)).toEqual({ number: 1, color: RED });
    expect(getCard(1)).toEqual({ number: 2, color: RED });
    expect(getCard(2)).toEqual({ number: 3, color: RED });
    expect(getCard(3)).toEqual({ number: 4, color: RED });
    expect(getCard(4)).toEqual({ number: 5, color: RED });
    expect(getCard(5)).toEqual({ number: 6, color: RED });
    expect(getCard(6)).toEqual({ number: 7, color: RED });
    expect(getCard(7)).toEqual({ number: 8, color: RED });
    expect(getCard(8)).toEqual({ number: 9, color: RED });
    expect(getCard(9)).toEqual({ number: 10, color: RED });
    expect(getCard(10)).toEqual({ number: 11, color: RED });
    expect(getCard(11)).toEqual({ number: 12, color: RED });
  });

  test("returs GREEN cards from 12 to 23", () => {
    expect(getCard(12)).toEqual({ number: 1, color: GREEN });
    expect(getCard(13)).toEqual({ number: 2, color: GREEN });
    expect(getCard(14)).toEqual({ number: 3, color: GREEN });
    expect(getCard(15)).toEqual({ number: 4, color: GREEN });
    expect(getCard(16)).toEqual({ number: 5, color: GREEN });
    expect(getCard(17)).toEqual({ number: 6, color: GREEN });
    expect(getCard(18)).toEqual({ number: 7, color: GREEN });
    expect(getCard(19)).toEqual({ number: 8, color: GREEN });
    expect(getCard(20)).toEqual({ number: 9, color: GREEN });
    expect(getCard(21)).toEqual({ number: 10, color: GREEN });
    expect(getCard(22)).toEqual({ number: 11, color: GREEN });
    expect(getCard(23)).toEqual({ number: 12, color: GREEN });
  });

  test("returs BLUE cards from 24 to 35", () => {
    expect(getCard(24)).toEqual({ number: 1, color: BLUE });
    expect(getCard(25)).toEqual({ number: 2, color: BLUE });
    expect(getCard(26)).toEqual({ number: 3, color: BLUE });
    expect(getCard(27)).toEqual({ number: 4, color: BLUE });
    expect(getCard(28)).toEqual({ number: 5, color: BLUE });
    expect(getCard(29)).toEqual({ number: 6, color: BLUE });
    expect(getCard(30)).toEqual({ number: 7, color: BLUE });
    expect(getCard(31)).toEqual({ number: 8, color: BLUE });
    expect(getCard(32)).toEqual({ number: 9, color: BLUE });
    expect(getCard(33)).toEqual({ number: 10, color: BLUE });
    expect(getCard(34)).toEqual({ number: 11, color: BLUE });
    expect(getCard(35)).toEqual({ number: 12, color: BLUE });
  });

  test("returs YELLOW cards from 36 to 47", () => {
    expect(getCard(36)).toEqual({ number: 1, color: YELLOW });
    expect(getCard(37)).toEqual({ number: 2, color: YELLOW });
    expect(getCard(38)).toEqual({ number: 3, color: YELLOW });
    expect(getCard(39)).toEqual({ number: 4, color: YELLOW });
    expect(getCard(40)).toEqual({ number: 5, color: YELLOW });
    expect(getCard(41)).toEqual({ number: 6, color: YELLOW });
    expect(getCard(42)).toEqual({ number: 7, color: YELLOW });
    expect(getCard(43)).toEqual({ number: 8, color: YELLOW });
    expect(getCard(44)).toEqual({ number: 9, color: YELLOW });
    expect(getCard(45)).toEqual({ number: 10, color: YELLOW });
    expect(getCard(46)).toEqual({ number: 11, color: YELLOW });
    expect(getCard(47)).toEqual({ number: 12, color: YELLOW });
  });
});
