const redis = require('redis');

const client = redis.createClient();

const defaultRobots = {
  red: [0, 0],
  blue: [2, 2],
};

client.on('error', (err) => {
  console.log(`Error ${err}`);
});

client.on('connect', () => {
  console.log('Connected to redis');
});


function getRobots(gid, ios) {
  const key = `game:${gid}:robots`;
  client.exists(key, (existsErr, existsRes) => {
    if (existsRes) {
      client.get(key, (getErr, getRes) => {
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

module.exports = {
  getRobots,
};
