<template>
  <div
    v-bind:class="inmove ? 'movetile' : 'tile'"
    v-bind:style="styledTile"
    v-on:click="$emit('click')"
  >
    <div class="tile-inner">
      <div v-if="tile.goal">
        <div class="goal" v-bind:style="{ color: tile.goal.color }">{{ tile.goal.index }}</div>
      </div>
      <!-- <h3>{{ robot }}</h3> -->
      <div v-if="robot !== ''">
        <div v-bind:style="{ backgroundColor: robot }" class="dot"></div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'tile',
  props: {
    tile: Object,
    robot: String,
    inmove: Boolean,
  },
  data() {
    return {
      styledTile: {
        borderTop: '1px solid black',
        borderRight: '1px solid black',
        borderBottom: '1px solid black',
        borderLeft: '1px solid black',
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
  background-color #e9e9cd

.movetile
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background-color #e9cdcd

.goal
  font-size 150%
  position absolute
  margin-top 2px
  margin-left 5px

.tile-inner
  position relative
  width 100%
  height 100%

.dot
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
  border 2px solid black
  position absolute
  margin 0 auto
  top 25%
  left 25%

</style>
