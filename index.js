'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

const userRouter = require('./routes/users');
const characterRouter = require('./routes/characters');
const authRouter = require('./routes/auth');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');

passport.use(localStrategy);
passport.use(jwtStrategy);

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(cors());

app.use(express.json());

app.use('/api/user', userRouter);
app.use('/api/character', characterRouter);
app.use('/api', authRouter);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
