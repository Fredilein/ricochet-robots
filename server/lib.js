const board = './assets/board.json';

function moveRobots(robots, move) {
  const robotsNew = {
    red: [0, 0],
    blue: [0, 2],
  };
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
