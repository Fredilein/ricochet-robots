<template>
  <div class="home">
    <h1>Ricochet Robots</h1>
    <p>Web version of the board game.</p>

    <gameList />

    <newGame />
  </div>
</template>

<script>
import newGame from '../components/Home/NewGame.vue';
import gameList from '../components/Home/GameList.vue';

export default {
  name: 'home',
  components: {
    newGame,
    gameList,
  },
};
</script>
