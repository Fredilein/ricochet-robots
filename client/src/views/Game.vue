<template>
  <div class="container game">
    <h1>Game</h1>
    {{ this.$route.params.gameId }}
    <h2>Board</h2>
    <board v-bind:board="board" />
  </div>
</template>

<script>
import socket from 'socket.io-client';
import board from '../components/Game/Board.vue';

export default {
  name: 'game',
  components: {
    board,
  },
  data() {
    return {
      board: {},
      socket: socket('localhost:4001'),
      error: '',
    };
  },
  mounted() {
    this.socket.emit('INIT', {
      gameId: this.$route.params.gameId,
    });
    this.socket.on('BOARD_UPDATE', (data) => {
      this.board = data.board;
    });
  },
};
</script>

<style lang="stylus">
.game
  margin-bottom 40px
</style>
