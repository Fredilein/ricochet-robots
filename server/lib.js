const _ = require('underscore');
const redis = require('./redis');
const board = require('./assets/board.json');

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
  for (i = 0; i < arr.length - 1; i += 2) {
    obj[arr[i]] = arr[i + 1];
  }
  return obj;
}

function parseGoals() {
  const goals = [];
  let r;
  let t;
  for (r = 0; r < board.rows.length; r += 1) {
    for (t = 0; t < board.rows[r].tiles.length; t += 1) {
      if (board.rows[r].tiles[t].goal !== null) {
        const g = board.rows[r].tiles[t].goal;
        g.coords = [r, t];
        goals.push(g);
      }
    }
  }
  return goals;
}


function randomGoal() {
  const goals = parseGoals();
  const goal = goals[Math.floor(Math.random() * goals.length)];
  return goal;
}

module.exports = {
  moveRobots,
  convertGuesses,
  parseGoals,
  randomGoal,
};
