<template>
  <div>
    <div v-if="guesses && JSON.stringify(guesses) !== '{}'">
      <h4>Guesses:</h4>
      <ul class="list-group guesses-list">
        <li
          v-for="(num, name, i) in guesses"
          v-bind:key="i"
          class="list-group-item d-flex justify-content-between align-items-center guess-item"
        >
          <span>{{ name }}</span>
          <span><strong>{{ num }}</strong></span>
        </li>
      </ul>
    </div>

    <div v-if="phase != 'proof'">
      <div class="form-group">
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control"
            aria-describedby="button-addon2"
            v-model="guess"
          />
          <div class="input-group-append">
            <button
              class="btn btn-outline-secondary"
              type="button"
              id="button-addon2"
              v-on:click="newGuess()"
            >
              Guess
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'guess',
  props: {
    guesses: Object,
    phase: String,
  },
  data() {
    return {
      guess: 0,
    };
  },
  methods: {
    newGuess() {
      if (this.guess > 0) {
        this.$emit('guess', this.guess);
      }
    },
  },
  mounted() {},
};
</script>

<style lang="stylus">
.guess-item
  padding-left 30px
  padding-right 30px

.guesses-list
  margin-bottom 20px
</style>
