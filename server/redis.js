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
  client.get(keyPhase, (_0, getRes) => {
    if (getRes !== 'proof') return;
    client.get(key, (_1, robots) => {
      const robotsNew = lib.moveRobots(robots, move);
      client.set(key, JSON.stringify(robotsNew));
      ios.to(gid).emit('ROBOTS_UPDATE', {
        robots: robotsNew,
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
      client.set(key, defaultPhase);
      ios.to(gid).emit('PHASE_UPDATE', {
        phase: defaultPhase,
      });
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
    client.set(key, nextPhaseName);
    ios.to(gid).emit('PHASE_UPDATE', {
      phase: nextPhaseName,
    });
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
    ios.to(gid).emit('GUESS_UPDATE', {
      guesses: lib.convertGuesses(guesses),
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
};
