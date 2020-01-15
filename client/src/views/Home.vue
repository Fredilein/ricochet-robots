<template>
  <div class="home">
    <h1>Ricochet Robots</h1>
    <p>Web version of the board game.</p>
    <ul class="list-group">
      <li v-for="game in games" v-bind:key="game._id" class="list-group-item">
        {{ game.name }}
      </li>
    </ul>
    {{ error }}

    <newGame />

  </div>
</template>

<script>
// @ is an alias to /src
import axios from 'axios';
import newGame from '../components/Home/NewGame.vue';

const API_URL = 'http://localhost:4001/games';

export default {
  name: 'home',
  components: {
    newGame,
  },
  data() {
    return {
      games: [],
      error: '',
    };
  },
  mounted() {
    axios.get(API_URL)
      .then((res) => {
        this.games = res.data;
      })
      .catch((err) => {
        this.error = err;
      });
  },
};
</script>
