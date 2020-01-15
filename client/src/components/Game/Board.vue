<template>
  <div>
    <table>
      <tr v-for="(row, i) in board.rows" v-bind:key="i">
        <td v-for="(tile, j) in row.tiles" v-bind:key="j">
          <tile v-bind:tile="tile" />
        </td>
      </tr>
    </table>
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
