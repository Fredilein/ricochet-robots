const morgan = require('morgan');
const hapi = require('hapi');

const io = require('socket.io');
const games = require('./db/games');

const board = require('./assets/board.json');

const redis = require('./redis.js');
const lib = require('./lib');

const server = hapi.server({
  port: 4001,
  host: 'localhost',
  routes: { cors: true },
});

const init = async () => {
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: (req, res) => 'Hello',
    },
    {
      method: 'GET',
      path: '/games',
      handler: (req, res) => games.getAll(),
    },
    {
      method: 'POST',
      path: '/games',
      handler: (req, res) => {
        const game = req.payload;
        console.log(game);
        return games.create(game);
      },
    },
  ]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();

const ios = io(server.listener);

ios.on('connection', (socket) => {
  console.log(`a user connected with id ${socket.id}`);

  socket.on('INIT', (data) => {
    const gid = data.gameId;
    const { playerName } = data;

    socket.join(gid);

    ios.to(gid).emit('BOARD_UPDATE', {
      board,
    });

    redis.getRobots(gid, ios);
    redis.joinPlayer(gid, playerName, ios);
    redis.getPhase(gid, ios);
    redis.getGuesses(gid, ios);
    redis.getGoal(gid, ios);
  });

  socket.on('NEW_GUESS', (data) => {
    redis.newGuess(data.gameId, data.playerName, data.guess, ios);
  });

  socket.on('NEW_MOVE', (data) => {
    redis.setRobots(data.gameId, data.move, ios);
  });

  socket.on('nextphasepls', (data) => {
    redis.nextPhase(data.gameId, ios);
  });

  socket.on('disconnect', () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});
