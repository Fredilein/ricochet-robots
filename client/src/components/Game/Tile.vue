<template>
  <div class="tile" v-bind:style="styledTile" />
</template>

<script>
import axios from 'axios';

export default {
  name: 'tile',
  props: {
    tile: Object,
  },
  data() {
    return {
      styledTile: {
        borderTop: '2px solid black',
        borderRight: '2px solid black',
        borderBottom: '2px solid black',
        borderLeft: '2px solid black',
      },
    };
  },
  mounted() {
    if (this.tile.walls.includes(0)) this.styledTile.borderTop = '5px solid black';
    if (this.tile.walls.includes(1)) this.styledTile.borderRight = '5px solid black';
    if (this.tile.walls.includes(2)) this.styledTile.borderBottom = '5px solid black';
    if (this.tile.walls.includes(3)) this.styledTile.borderLeft = '5px solid black';
  },
};
</script>

<style lang="stylus">
.tile
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: gold;
</style>
