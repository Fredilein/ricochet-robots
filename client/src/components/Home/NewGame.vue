<template>
  <div>
    <div class="form-group">
      <label for="name">Game Name</label>
      <input class="form-control" id="name" type="text" v-model="name" />
      <br />
      <label for="players">Player Names</label>
      <input
        class="form-control"
        id="players"
        type="text"
        v-for="(player, index) in players"
        v-model="players[index]"
        v-bind:key="index"
      />
      <button type="button" class="btn btn-primary" v-on:click="addPlayer">
        Add Player
      </button>
    </div>

    <button type="button" class="btn btn-primary" v-on:click="createGame">
      Create Game
    </button>
  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:4001/games';

export default {
  name: 'newGame',
  data() {
    return {
      name: '',
      players: ['Player 1'],
    };
  },
  methods: {
    addPlayer(e) {
      e.preventDefault();
      this.players.push(`Player ${this.playerNames.length + 1}`);
    },
    createGame(e) {
      e.preventDefault();
      if (this.name === '' || this.players.length < 1 || this.players.length > 4) {
        alert('Invalid settings');
        return;
      }

      axios
        .post(API_URL, {
          name: this.name,
          players: this.players,
        })
        .then((res) => {
          console.log(res);
          window.location.reload(true);
        })
        .catch((err) => {
          alert(`Error: ${err}`);
        });
    },
  },
};
</script>
