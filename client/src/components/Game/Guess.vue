<template>
  <div>
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
    {{ guesses }}
  </div>
</template>

<script>
export default {
  name: 'guess',
  props: {
    guesses: Object,
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
