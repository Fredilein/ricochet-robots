<template>
  <div>
    <h2>Hello {{ playerName }}</h2>
    <div class="form-group">
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          aria-label="Recipient's username"
          aria-describedby="button-addon2"
          v-model="playerName"
        />
        <div class="input-group-append">
          <button
            class="btn btn-outline-secondary"
            type="button"
            id="button-addon2"
            v-on:click="changeName()"
          >
            Change Name
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import store from '../../store';

export default {
  name: 'playerName',
  data() {
    return {
      playerName: '',
    };
  },
  methods: {
    changeName() {
      store.setPlayerName(this.playerName);
    },
  },
  mounted() {
    this.playerName = store.getPlayerName();
  },
};
</script>

<style lang="stylus"></style>
