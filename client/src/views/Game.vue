<template>
  <div class="container game">
    <h1>Game</h1>
    <h2>Board</h2>
    <board v-bind:board="board" v-bind:robots="robots" />

    <h2>Scoreboard</h2>
    <scoreboard v-bind:players="players" />
  </div>
</template>

<script>
import socket from 'socket.io-client';
import board from '../components/Game/Board.vue';
import scoreboard from '../components/Game/Scoreboard.vue';
import store from '../store';

export default {
  name: 'game',
  components: {
    board,
    scoreboard,
  },
  data() {
    return {
      board: {},
      robots: {},
      players: {},
      socket: socket('localhost:4001'),
      error: '',
    };
  },
  mounted() {
    this.socket.emit('INIT', {
      gameId: this.$route.params.gameId,
      playerName: store.getPlayerName(),
    });
    this.socket.on('BOARD_UPDATE', (data) => {
      this.board = data.board;
    });
    this.socket.on('ROBOTS_UPDATE', (data) => {
      console.log('received update');
      this.robots = data.robots;
    });
    this.socket.on('SCORE_UPDATE', (data) => {
      this.players = data.players;
    });
  },
};
</script>

<style lang="stylus">
.game
  margin-bottom 40px
</style>
