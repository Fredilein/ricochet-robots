const Joi = require('joi');
const db = require('./connection');

const schema = Joi.object().keys({
  name: Joi.string().required(),
  players: Joi.array().items(Joi.string()),
});

const games = db.get('games');

function getAll() {
  return games.find();
}

function create(game) {
  if (!game.name) game.name = 'New Game';

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
