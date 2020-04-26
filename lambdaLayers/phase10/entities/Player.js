class Player {
  constructor(connectionId, name, color = null) {
    this.connectionId = connectionId;
    this.name = name;
    this.phase = 1;
    this.boardPosition = 0;
    this.cards = [];
    this.collections = [];
    this.color = color;
  }
}

module.exports = Player;
