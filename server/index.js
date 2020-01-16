const morgan = require('morgan');
const hapi = require('hapi');

const io = require('socket.io');
const games = require('./db/games');

const board = require('./assets/board.json');

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
    socket.join(gid);

    ios.to(gid).emit('BOARD_UPDATE', {
      board,
    });
  });
});
