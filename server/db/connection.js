const monk = require('monk');

const connectionString = process.env.MONGODB_URI || 'localhost/ricochet-robots';
const db = monk(connectionString);

module.exports = db;
