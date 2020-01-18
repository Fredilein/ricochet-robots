function generateName() {
  return `Player${Math.floor(Math.random() * 100000)}`;
}

function setName() {
  const stored = localStorage.getItem('ricochet-robots-name');
  if (stored) {
    return stored;
  }
  localStorage.setItem('ricochet-robots-name', generateName());
  return localStorage.getItem('ricochet-robots-name');
}

const store = {
  state: {
    playerName: setName(),
  },
  getPlayerName() {
    return localStorage.getItem('ricochet-robots-name');
  },
  setPlayerName(name) {
    if (name) {
      localStorage.setItem('ricochet-robots-name', name);
    } else {
      localStorage.setItem('ricochet-robots-name', generateName());
    }
    this.state.playerName = localStorage.getItem('ricochet-robots-name');
  },
};

export default store;
