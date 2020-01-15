<template>
  <div class="about">
    <h1>Game</h1>
    {{ this.$route.params.gameId }}
    <h2>Board</h2>
    {{ board }}
  </div>
</template>

<script>
import socket from 'socket.io-client';

export default {
  name: 'game',
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
