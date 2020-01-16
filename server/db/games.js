const Joi = require('joi');
const db = require('./connection');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  players: Joi.array().items(Joi.string()),
  robots: Joi.object().keys({
    red: Joi.array().items(Joi.number()),
    blue: Joi.array().items(Joi.number()),
  }),
});

const games = db.get('games');

function getAll() {
  return games.find();
}

function getRobots(id) {
  return games.findOne({ _id: id }, 'robots');
}

function create(game) {
  if (!game.name) game.name = 'New Game';

  // Insert robots at startposition
  game.robots = {
    blue: [2, 2],
    red: [0, 0],
  };

  const result = Joi.validate(game, schema);
  console.log(result);
  if (result.error == null) {
    game.created = new Date();
    return games.insert(game);
  }
  return Promise.reject(result.error);
}

module.exports = {
  create,
  getAll,
};
