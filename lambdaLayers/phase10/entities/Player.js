class Player {
  constructor(connectionId, name) {
    this.connectionId = connectionId;
    this.name = name;
    this.phase = 1;
    this.boardPosition = 0;
    this.cards = [];
    this.collections = [];
    this.color = null;
  }
}

module.exports = Player;
