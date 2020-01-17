function generateName() {
  return `Player${Math.floor(Math.random() * 100000)}`;
}

const store = {
  state: {
    playerName: '',
  },
  getPlayerName() {
    if (this.state.playerName === '') {
      this.state.playerName = generateName();
    }
    return this.state.playerName;
  },
  setPlayerName(name) {
    this.state.playerName = name;
  },
};

export default store;
