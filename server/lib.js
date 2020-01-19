const _ = require('underscore');
const redis = require('./redis');
const board = require('./assets/board.json');

function moveRobots(robots, move) {
  const inv = _.invert(robots);
  const color = inv[move[0]];
  if (!color) return false;
  if (move[1] in inv) return false;
  const rStart = move[0][0];
  const cStart = move[0][1];
  const rEnd = move[1][0];
  const cEnd = move[1][1];
  const endtile = board.rows[rEnd].tiles[cEnd].walls;
  const starttile = board.rows[rStart].tiles[cStart].walls;
  if (rStart === rEnd && cStart === cEnd) {
    return false;
  }
  if (rStart === rEnd) {
    // check for robots and walls in between (horizontal)
    const s = Math.min(cStart, cEnd);
    const t = Math.max(cStart, cEnd);
    for (let i = s + 1; i < t; i += 1) {
      if ([rStart, i] in inv) return false;
      const walls = board.rows[rStart].tiles[i].walls;
      if (walls.includes(1) || walls.includes(3)) return false;
    }
    // check landing
    if (cStart < cEnd) {
      if (starttile.includes(1)) return false;
      if (!endtile.includes(1) && !([rEnd, cEnd + 1] in inv)) return false;
    } else {
      if (starttile.includes(3)) return false;
      if (!endtile.includes(3) && !([rEnd, cEnd - 1] in inv)) return false;
    }
  } else if (cStart === cEnd) {
    // check for robots and walls in between (vertical)
    const s = Math.min(rStart, rEnd);
    const t = Math.max(rStart, rEnd);
    for (let i = s + 1; i < t; i += 1) {
      if ([i, cStart] in inv) return false;
      const walls = board.rows[i].tiles[cStart].walls;
      if (walls.includes(0) || walls.includes(2)) return false;
    }
    // check landing
    if (rStart < rEnd) {
      if (starttile.includes(2)) return false;
      if (!endtile.includes(2) && !([rEnd + 1, cEnd] in inv)) return false;
    } else {
      if (starttile.includes(0)) return false;
      if (!endtile.includes(0) && !([rEnd - 1, cEnd] in inv)) return false;
    }
  } else {
    return false;
  }
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

function checkGoal(robots, goal) {
  if (JSON.stringify(robots[goal.color]) === JSON.stringify(goal.coords)) {
    return true;
  }
  return false;
}

module.exports = {
  moveRobots,
  convertGuesses,
  parseGoals,
  randomGoal,
  checkGoal,
};
