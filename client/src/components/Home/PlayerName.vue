<template>
  <div>
    <h2>Hello {{ playerName }}</h2>
    <div class="form-group">
      <div class="input-group mb-3">
        <input
          type="text"
          class="form-control"
          aria-describedby="button-addon2"
          v-model="inputName"
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
      inputName: '',
      playerName: '',
    };
  },
  methods: {
    changeName() {
      store.setPlayerName(this.inputName);
      this.playerName = store.getPlayerName();
    },
  },
  mounted() {
    this.playerName = store.getPlayerName();
    this.inputName = this.playerName;
  },
};
</script>

<style lang="stylus"></style>
