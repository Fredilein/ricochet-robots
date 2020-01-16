<template>
  <div>
    <table>
      <tr v-for="(row, i) in board.rows" v-bind:key="i">
        <td v-for="(tile, j) in row.tiles" v-bind:key="j">
          <tile v-bind:tile="tile" v-bind:robot="robots | checkRobot(i, j)" />
        </td>
      </tr>
    </table>

    <h2>Robots board</h2>
    {{ robots }}
  </div>
</template>

<script>
import axios from 'axios';
import tile from './Tile.vue';

export default {
  name: 'board',
  components: {
    tile,
  },
  props: {
    board: Object,
    robots: Object,
  },
  filters: {
    checkRobot(r, i, j) {
      let color = '';
      if (r === {}) return color;
      Object.keys(r).forEach((key) => {
        if (r[key][0] === i && r[key][1] === j) color = key;
      });
      return color;
    },
  },
  mounted() {
    console.log(`Robots: ${JSON.stringify(this.robots)}`);
  },
};
</script>

<style lang="stylus">
table {
  width: 100%;
}
td {
  width: 33.33%;
  position: relative;
}
td:after {
  content: '';
  display: block;
  margin-top: 100%;
}
</style>
