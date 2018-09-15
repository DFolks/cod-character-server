'use strict';

const mongoose = require('mongoose');

const { MONGODB_URL } = require('../config');

const User = require('../models/user');
const Character = require('../models/characters');

const seedUser = require('../db/users');
const seedCharacter = require('../db/characters');

console.log(`Connecting to mongodb at ${MONGODB_URL}`);
mongoose
  .connect(MONGODB_URL)
  .then(() => {
    console.info('Dropping Database');
    return mongoose.connection.db.dropDatabase();
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      User.insertMany(seedUser),
      User.createIndexes(),
      Character.insertMany(seedCharacter),
      Character.createIndexes()
    ]);
  })
  .then(() => {
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
