<template>
  <div>
    <ul class="list-group">
      <li v-for="game in games" v-bind:key="game._id" class="list-group-item">
        <router-link class="name" :to="{ name: 'game', params: { gameId: game._id } }">
          {{ game.name }}
        </router-link>
      </li>
    </ul>
    {{ error }}

  </div>
</template>

<script>
import axios from 'axios';

const API_URL = 'http://localhost:4001/games';

export default {
  name: 'gameList',
  data() {
    return {
      games: [],
      error: '',
    };
  },
  mounted() {
    axios
      .get(API_URL)
      .then((res) => {
        this.games = res.data;
      })
      .catch((err) => {
        this.error = err;
      });
  },
};
</script>
