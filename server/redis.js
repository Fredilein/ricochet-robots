const redis = require('redis');
const lib = require('./lib');

const client = redis.createClient();

const defaultRobots = {
  red: [1, 1],
  blue: [1, 14],
  green: [14, 1],
  yellow: [14, 14],
  grey: [7, 5],
};
const defaultPlayer = {
  score: 0,
};
const defaultPhase = 'guess';

client.on('error', (err) => {
  console.log(`Error ${err}`);
});

client.on('connect', () => {
  console.log('Connected to redis');
});

function initGame(gid, ios) {
  console.log('init game');
  const key = `game:${gid}:phase`;
  client.set(key, defaultPhase);
  setGoal(gid, lib.randomGoal(), ios);
  ios.to(gid).emit('PHASE_UPDATE', {
    phase: defaultPhase,
  });
}

function initPhase(gid, phase, ios) {
  switch (phase) {
    case 'guess':
      console.log('init phase guess');
      removeGuesses(gid, ios);
      removeTurn(gid, ios);
      const goal = lib.randomGoal();
      setGoal(gid, goal, ios);
      break;
    case 'timer':
      console.log('init phase timer');
      setTimeout(() => {
        nextPhase(gid, ios);
      }, 30000);
      break;
    case 'proof':
      console.log('init phase proof');
      const keyRobots = `game:${gid}:robots`;
      const keyBackup = `game:${gid}:robots:backup`;
      const keyCounter = `game:${gid}:counter`;
      client.get(keyRobots, (_0, robots) => {
        client.set(keyBackup, robots, (_1, _2) => {
          nextPlayerProof(gid, ios);
        });
      });
      client.set(keyCounter, 0);
      break;
    default:
      process.exit(1);
  }
}

function getRobots(gid, ios) {
  const key = `game:${gid}:robots`;
  client.exists(key, (_0, existsRes) => {
    if (existsRes) {
      client.get(key, (_1, getRes) => {
        ios.to(gid).emit('ROBOTS_UPDATE', {
          robots: JSON.parse(getRes),
        });
      });
    } else {
      client.set(key, JSON.stringify(defaultRobots));
      ios.to(gid).emit('ROBOTS_UPDATE', {
        robots: defaultRobots,
      });
    }
  });
}

function setRobots(gid, move, ios) {
  const key = `game:${gid}:robots`;
  const keyPhase = `game:${gid}:phase`;
  const keyGoal = `game:${gid}:goal`;
  const keyCounter = `game:${gid}:counter`;
  const keyTurn = `game:${gid}:turn`;
  const keyScores = `game:${gid}:scores`;
  client.get(keyPhase, (_0, getRes) => {
    if (getRes !== 'proof') return;
    client.get(key, (_1, robots) => {
      const robotsNew = lib.moveRobots(JSON.parse(robots), move);
      if (!robotsNew) return;
      client.set(key, JSON.stringify(robotsNew));
      ios.to(gid).emit('ROBOTS_UPDATE', {
        robots: robotsNew,
      });
      client.get(keyGoal, (_2, goal) => {
        client.get(keyTurn, (_3, turn) => {
          const turnJson = JSON.parse(turn);
          if (lib.checkGoal(robotsNew, JSON.parse(goal))) {
            console.log('GOAL!');
            client.hincrby(keyScores, turnJson[0], 1, (_4, _5) => {
              client.hgetall(keyScores, (_6, allRes) => {
                ios.to(gid).emit('SCORE_UPDATE', {
                  players: allRes,
                });
              });
              nextPhase(gid, ios);
            });
          } else {
            client.incr(keyCounter, (_7, c) => {
              if (c >= turnJson[1]) {
                console.log('Too many moves');
                nextPlayerProof(gid, ios);
              } else {
                ios.to(gid).emit('COUNT_UPDATE', {
                  count: c,
                });
              }
            });
          }
        });
      });
    });
  });
}

function joinPlayer(gid, name, ios) {
  const key = `game:${gid}:scores`;
  client.hkeys(key, (_0, fieldsRes) => {
    if (fieldsRes.includes(name)) {
      client.hgetall(key, (_1, allRes) => {
        ios.to(gid).emit('SCORE_UPDATE', {
          players: allRes,
        });
      });
    } else {
      client.hset(key, name, 0, (_2, _3) => {
        client.hgetall(key, (_4, allRes) => {
          ios.to(gid).emit('SCORE_UPDATE', {
            players: allRes,
          });
        });
      });
    }
  });
}

function getPhase(gid, ios) {
  const key = `game:${gid}:phase`;
  client.exists(key, (_0, existsRes) => {
    if (existsRes) {
      client.get(key, (_1, getRes) => {
        ios.to(gid).emit('PHASE_UPDATE', {
          phase: getRes,
        });
      });
    } else {
      initGame(gid, ios);
    }
  });
}

function nextPhase(gid, ios) {
  const key = `game:${gid}:phase`;
  client.get(key, (_0, getRes) => {
    let nextPhaseName = '';
    switch (getRes) {
      case 'guess':
        nextPhaseName = 'timer';
        break;
      case 'timer':
        nextPhaseName = 'proof';
        break;
      case 'proof':
        nextPhaseName = 'guess';
        break;
      default:
        process.exit(1);
    }
    ios.to(gid).emit('PHASE_UPDATE', {
      phase: nextPhaseName,
    });
    client.set(key, nextPhaseName);
    initPhase(gid, nextPhaseName, ios);
  });
}

function newGuess(gid, name, guess, ios) {
  const key = `game:${gid}:guesses`;
  const keyPhase = `game:${gid}:phase`;
  client.get(keyPhase, (_0, phase) => {
    if (phase === 'proof') return;
    client.zadd(key, guess, name, (_1, _2) => {
      client.zrange(key, 0, -1, 'WITHSCORES', (_3, guesses) => {
        ios.to(gid).emit('GUESS_UPDATE', {
          guesses: lib.convertGuesses(guesses),
        });
      });
    });
    if (phase === 'guess') nextPhase(gid, ios);
  });
}

function getGuesses(gid, ios) {
  const key = `game:${gid}:guesses`;
  client.zrange(key, 0, -1, 'WITHSCORES', (_0, guesses) => {
    const g = guesses ? lib.convertGuesses(guesses) : [];
    ios.to(gid).emit('GUESS_UPDATE', {
      guesses: g,
    });
  });
}

function setGoal(gid, goal, ios) {
  const key = `game:${gid}:goal`;
  console.log(`goal${JSON.stringify(goal)}`);
  client.set(key, JSON.stringify(goal));
  ios.to(gid).emit('GOAL_UPDATE', {
    goal,
  });
}

function getGoal(gid, ios) {
  const key = `game:${gid}:goal`;
  client.exists(key, (_0, exists) => {
    if (exists) {
      client.get(key, (_1, goal) => {
        ios.to(gid).emit('GOAL_UPDATE', {
          goal: JSON.parse(goal),
        });
      });
    } else {
      initGame(gid, ios);
    }
  });
}

function nextPlayerProof(gid, ios) {
  const keyRobots = `game:${gid}:robots`;
  const keyBackup = `game:${gid}:robots:backup`;
  const keyTurn = `game:${gid}:turn`;
  const keyGuesses = `game:${gid}:guesses`;
  const keyCounter = `game:${gid}:counter`;
  client.get(keyBackup, (_0, robots) => {
    client.set(keyRobots, robots);
    ios.to(gid).emit('ROBOTS_UPDATE', {
      robots: JSON.parse(robots),
    });
  });
  client.zpopmin(keyGuesses, (_1, guess) => {
    if (guess.length > 0) {
      client.set(keyTurn, JSON.stringify(guess));
      client.set(keyCounter, 0);
      ios.to(gid).emit('TURN_UPDATE', {
        turn: guess,
      });
      ios.to(gid).emit('COUNT_UPDATE', {
        count: 0,
      });
      getGuesses(gid, ios);
    } else {
      client.set(keyTurn, '');
      ios.to(gid).emit('TURN_UPDATE', {
        turn: [],
      });
      nextPhase(gid, ios);
    }
  });
}

function createBackup(gid, ios) {
  const keyRobots = `game:${gid}:robots`;
  const keyBackup = `game:${gid}:robots:backup`;
  client.get(keyRobots, (_1, robots) => {
    client.set(keyBackup, robots);
  });
}

function removeGuesses(gid, ios) {
  const key = `game:${gid}:guesses`;
  client.zremrangebyrank(key, 0, -1);
  ios.to(gid).emit('GUESS_UPDATE', {
    guesses: {},
  });
}

function removeTurn(gid, ios) {
  const keyTurn = `game:${gid}:turn`;
  client.set(keyTurn, '');
  ios.to(gid).emit('TURN_UPDATE', {
    turn: [],
  });
}

function getTurn(gid, ios) {
  const keyTurn = `game:${gid}:turn`;
  client.get(keyTurn, (_3, turn) => {
    if (!turn) return;
    const turnJson = JSON.parse(turn);
    ios.to(gid).emit('TURN_UPDATE', {
      turn: turnJson,
    });
  });
}

function getCount(gid, ios) {
  const keyCounter = `game:${gid}:counter`;
  client.get(keyCounter, (_0, c) => {
    if (!c) return;
    ios.to(gid).emit('COUNT_UPDATE', {
      count: c,
    });
  });
}

module.exports = {
  getRobots,
  joinPlayer,
  getPhase,
  newGuess,
  getGuesses,
  nextPhase,
  setRobots,
  setGoal,
  getGoal,
  nextPlayerProof,
  createBackup,
  removeGuesses,
  removeTurn,
  getTurn,
  getCount,
};
