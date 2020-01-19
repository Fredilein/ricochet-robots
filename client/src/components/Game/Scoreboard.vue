<template>
  <div>
    <ul class="list-group score-list">
      <li
        v-for="(score, name, i) in players"
        v-bind:key="i"
        class="list-group-item d-flex justify-content-between align-items-center guess-item"
      >
        <span>{{ name }}</span>
        <span
          ><strong>{{ score }}</strong></span
        >
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'scoreboard',
  props: {
    players: Object,
  },
  data() {
    return {};
  },
  mounted() {},
};
</script>

<style lang="stylus">
.score-list
  margin-bottom 20px
</style>
