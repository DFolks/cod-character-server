'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Merit = require('../models/merit');

const router = express.Router();

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

//==========GET ALL MERITS===================
router.get('/', (req, res, next) => {
  Merit.find()
    .sort({ name: 'asc' })
    .then(results => res.json(results))
    .catch(err => next(err));
});

//================GET MERIT BY ID==================
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Merit.findById({ _id: id, userId })
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(err => next(err));
});

//===============POST A NEW MERIT===============
router.post('/', (req, res, next) => {
  const { name, rating, prerequisites, description } = req.body;
  const userId = req.user.id;

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!rating) {
    const err = new Error('Missing `rating` in request body');
    err.status = 400;
    return next(err);
  }

  const newMerit = { name, rating, description, prerequisites, userId };

  Merit.create(newMerit)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The merit name already exists');
        err.status = 400;
      }
      next(err);
    });
});

//=========PUT merit by id to update=============
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { name, rating, prerequisites, description } = req.body;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  if (!rating) {
    const err = new Error('Missing `rating` in request body');
    err.status = 400;
    return next(err);
  }

  const updateTag = { name, rating, description, prerequisites, userId };

  Merit.findOneAndUpdate({ _id: id, userId }, updateTag, { new: true })
    .then(result => (result ? res.json(result) : next()))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The merit name already exists');
        err.status = 400;
      }
      next(err);
    });
});

// ===========DELETE a merit by id==============
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Merit.findOneAndRemove({ _id: id, userId })
    .then(() => res.status(204).end())
    .catch(err => next(err));
});
module.exports = router;
