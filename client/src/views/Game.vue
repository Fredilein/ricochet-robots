<template>
  <div class="container game">
    <h3>{{ this.$route.params.gameName }}, {{ name }}</h3>

    <!-- <h2>Phase</h2> -->
    <!-- <p>Phase: {{ phase }}</p> -->

    <h4>Goal: {{ goal ? goal.color + goal.index : 'no goal...' }}</h4>
    <h4>Phase: {{ phase }}</h4>

    <guess v-bind:guesses="guesses" v-bind:phase="phase" v-on:guess="sendGuess($event)" />

    <div v-if="turn[0] && turn[0] === name">
      <h4>
        It's YOUR turn!
      </h4>
      <button class="btn btn-primary" v-on:click="passTurn()">
        Pass
      </button>
    </div>
    <div v-else-if="turn[0]">
      <h4>It's {{ turn[0] }}'s turn</h4>
    </div>
    <div v-if="turn && turn[1] > 0">
      <h4>{{ turn[1] - count }} moves remaining</h4>
    </div>

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
      count: 0,
      goal: {},
      name: '',
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
      if (prevGuess && prevGuess < num) return;
      this.socket.emit('NEW_GUESS', {
        gameId: this.$route.params.gameId,
        playerName: store.getPlayerName(),
        guess: num,
      });
    },
    nextPhase() {
      this.socket.emit('nextphasepls', {
        gameId: this.$route.params.gameId,
      });
    },
    sendMove(move) {
      console.log(`turn: ${this.turn}`);
      console.log(`player: ${store.getPlayerName()}`);
      if (this.turn[0] && store.getPlayerName() === this.turn[0]) {
        this.socket.emit('NEW_MOVE', {
          gameId: this.$route.params.gameId,
          move,
        });
      }
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
    this.name = store.getPlayerName();
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
    this.socket.on('COUNT_UPDATE', (data) => {
      this.count = data.count;
    });
  },
};
</script>

<style lang="stylus">
.game
  margin-bottom 40px
</style>
