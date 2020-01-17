<template>
  <div>
    <!-- <ul class="list-group"> -->
    <!--   <li v-for="(player, i) in players" v-bind:key="i" class="list-group-item"> -->
    <!--     {{ player.name }} -->
    <!--   </li> -->
    <!-- </ul> -->
    {{ players }}
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
