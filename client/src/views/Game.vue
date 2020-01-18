<template>
  <div class="container game">
    <h1>{{ this.$route.params.gameName }}</h1>

    <h2>Phase</h2>
    <p>Phase: {{ phase }}</p>

    <h2>Goal</h2>
    <p>{{ goal }}</p>

    <h2>Guess</h2>
    <guess v-bind:guesses="guesses" v-on:guess="sendGuess($event)" />

    <h2>Turn</h2>
    <p>{{ turn }}</p>
    <button class="btn btn-primary" v-on:click="passTurn()">
      Pass
    </button>


    <h2>Board</h2>
    <board v-bind:board="board" v-bind:robots="robots" v-on:new-move="sendMove($event)" />

    <h2>Scoreboard</h2>
    <scoreboard v-bind:players="players" />

    <button class="btn btn-primary" v-on:click="nextPhase()">
      Next Phase
    </button>
  </div>
</template>

<script>
import socket from 'socket.io-client';
import board from '../components/Game/Board.vue';
import scoreboard from '../components/Game/Scoreboard.vue';
import guess from '../components/Game/Guess.vue';
import store from '../store';

export default {
  name: 'game',
  components: {
    board,
    scoreboard,
    guess,
  },
  data() {
    return {
      board: {},
      robots: {},
      players: {},
      guesses: {},
      phase: '',
      turn: {},
      goal: {},
      socket: socket('localhost:4001'),
      error: '',
    };
  },
  methods: {
    sendGuess(num) {
      console.log(this.guesses);
      console.log(store.getPlayerName());
      const name = store.getPlayerName();
      const prevGuess = this.guesses[name];
      if (!prevGuess || prevGuess > num) {
        this.socket.emit('NEW_GUESS', {
          gameId: this.$route.params.gameId,
          playerName: store.getPlayerName(),
          guess: num,
        });
      }
    },
    nextPhase() {
      this.socket.emit('nextphasepls', {
        gameId: this.$route.params.gameId,
      });
    },
    sendMove(move) {
      this.socket.emit('NEW_MOVE', {
        gameId: this.$route.params.gameId,
        move,
      });
    },
    passTurn() {
      if (this.phase === 'proof') {
        this.socket.emit('PASS_TURN', {
          gameId: this.$route.params.gameId,
        });
      }
    },
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
    this.socket.on('PHASE_UPDATE', (data) => {
      this.phase = data.phase;
    });
    this.socket.on('GUESS_UPDATE', (data) => {
      this.guesses = data.guesses;
    });
    this.socket.on('GOAL_UPDATE', (data) => {
      this.goal = data.goal;
    });
    this.socket.on('TURN_UPDATE', (data) => {
      this.turn = data.turn;
    });
  },
};
</script>

<style lang="stylus">
.game
  margin-bottom 40px
</style>
