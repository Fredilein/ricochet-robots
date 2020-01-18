const redis = require('redis');
const lib = require('./lib');

const client = redis.createClient();

const defaultRobots = {
  red: [0, 0],
  blue: [2, 2],
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
      break;
    case 'proof':
      console.log('init phase proof');
      const keyRobots = `game:${gid}:robots`;
      const keyBackup = `game:${gid}:robots:backup`;
      client.get(keyRobots, (_0, robots) => {
        client.set(keyBackup, robots, (_1, _2) => {
          nextPlayerProof(gid, ios);
        });
      });
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
        if (lib.checkGoal(robotsNew, JSON.parse(goal))) {
          console.log('GOAL!');
        }
      });
    });
  });
}

function joinPlayer(gid, name, ios) {
  const key = `game:${gid}:players`;
  client.hkeys(key, (_0, fieldsRes) => {
    if (fieldsRes.includes(name)) {
      client.hgetall(key, (_1, allRes) => {
        ios.to(gid).emit('SCORE_UPDATE', {
          players: allRes,
        });
      });
    } else {
      client.hset(key, name, JSON.stringify(defaultPlayer), (_2, _3) => {
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
  client.get(keyPhase, (_0, getRes) => {
    if (getRes === 'proof') return;
    client.zadd(key, guess, name, (_1, _2) => {
      client.zrange(key, 0, -1, 'WITHSCORES', (_3, guesses) => {
        ios.to(gid).emit('GUESS_UPDATE', {
          guesses: lib.convertGuesses(guesses),
        });
      });
    });
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
  client.get(keyBackup, (_0, robots) => {
    client.set(keyRobots, robots);
    ios.to(gid).emit('ROBOTS_UPDATE', {
      robots: JSON.parse(robots),
    });
  });
  client.zpopmin(keyGuesses, (_1, guess) => {
    if (guess.length > 0) {
      client.set(keyTurn, JSON.stringify(guess));
      ios.to(gid).emit('TURN_UPDATE', {
        turn: guess,
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
};
