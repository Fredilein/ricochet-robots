const board = './assets/board.json';
const _ = require('underscore');

function moveRobots(robots, move) {
  const inv = _.invert(robots);
  const color = inv[move[0]];
  if (!color) return false;

  const robotsNew = robots;
  robotsNew[color] = move[1];
  return robotsNew;
}

function convertGuesses(arr) {
  const obj = {};
  let i;
  for (i = 0; i < arr.length; i += 2) {
    obj[arr[i]] = arr[i + 1];
  }
  return obj;
}

module.exports = {
  moveRobots,
  convertGuesses,
};
