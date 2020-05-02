class Player {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.phase = 1;
    this.boardPosition = 0;
    this.cards = [];
    this.collections = [];
  }
}

module.exports = Player;
