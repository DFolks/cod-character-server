'use strict';

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const Character = require('../models/character');

const router = express.Router();

router.use(
  '/',
  passport.authenticate('jwt', { session: false, failWithError: true })
);

// ==================GET/READ ALL CHARACTERS====================
router.get('/', (req, res, next) => {
  const userId = req.user.id;
  let filter = { userId };

  Character.find(filter)
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

//==================GET/READ SINGLE CHARACTER===============
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Character.findById({ _id: id, userId })
    .populate('merits', 'name')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

// =========POST/CREATE A CHARACTER============
router.post('/', (req, res, next) => {
  const {
    name,
    strength,
    dexterity,
    stamina,
    intelligence,
    wits,
    resolve,
    presence,
    manipulation,
    composure,
    academics,
    computers,
    crafts,
    investigation,
    medicine,
    occult,
    politics,
    science,
    athletics,
    brawl,
    drive,
    firearms,
    larceny,
    stealth,
    survival,
    weaponry,
    animalKen,
    empathy,
    expression,
    intimidation,
    persuasion,
    socialize,
    streetwise,
    subterfuge,
    size,
    armor,
    beats,
    experience,
    health,
    willpower,
    integrity,
    age,
    player,
    virtue,
    vice,
    concept,
    chronicle,
    faction,
    group
  } = req.body;
  const userId = req.user.id;
  const newCharacter = {
    name,
    strength,
    dexterity,
    stamina,
    intelligence,
    wits,
    resolve,
    presence,
    manipulation,
    composure,
    academics,
    computers,
    crafts,
    investigation,
    medicine,
    occult,
    politics,
    science,
    athletics,
    brawl,
    drive,
    firearms,
    larceny,
    stealth,
    survival,
    weaponry,
    animalKen,
    empathy,
    expression,
    intimidation,
    persuasion,
    socialize,
    streetwise,
    subterfuge,
    size,
    armor,
    beats,
    experience,
    health,
    willpower,
    integrity,
    age,
    player,
    virtue,
    vice,
    concept,
    chronicle,
    faction,
    group,
    userId
  };

  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  Character.create(newCharacter)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});

// ============PUT/UPDATE A CHARACTER =================
router.patch('/:id', (req, res, next) => {
  const { id } = req.params;
  const updatablefields = [
    'name',
    'strength',
    'dexterity',
    'stamina',
    'intelligence',
    'wits',
    'resolve',
    'presence',
    'manipulation',
    'composure',
    'academics',
    'computers',
    'crafts',
    'investigation',
    'medicine',
    'occult',
    'politics',
    'science',
    'athletics',
    'brawl',
    'drive',
    'firearms',
    'larceny',
    'stealth',
    'survival',
    'weaponry',
    'animalKen',
    'empathy',
    'expression',
    'intimidation',
    'persuasion',
    'socialize',
    'streetwise',
    'subterfuge',
    'size',
    'armor',
    'beats',
    'experience',
    'merits',
    'health',
    'willpower',
    'integrity',
    'conditions',
    'aspirations',
    'age',
    'player',
    'virtue',
    'vice',
    'concept',
    'chronicle',
    'faction',
    'group'
  ];
  const {
    name,
    strength,
    dexterity,
    stamina,
    intelligence,
    wits,
    resolve,
    presence,
    manipulation,
    composure,
    academics,
    computers,
    crafts,
    investigation,
    medicine,
    occult,
    politics,
    science,
    athletics,
    brawl,
    drive,
    firearms,
    larceny,
    stealth,
    survival,
    weaponry,
    animalKen,
    empathy,
    expression,
    intimidation,
    persuasion,
    socialize,
    streetwise,
    subterfuge,
    size,
    armor,
    beats,
    experience,
    merits,
    health,
    willpower,
    integrity,
    conditions,
    aspirations,
    age,
    player,
    virtue,
    vice,
    concept,
    chronicle,
    faction,
    group
  } = req.body;
  const userId = req.user.id;
  const updateChar = {};

  updatablefields.forEach(field => {
    if (field in req.body) {
      updateChar[field] = req.body[field];
    }
  });

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  Character.findByIdAndUpdate({ _id: id, userId }, updateChar, { new: true })
    .then(result => {
      result ? res.json(result) : next();
    })
    .catch(err => next(err));
});

//============DELETE/REMOVE A CHARACTER==================
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Character.findOneAndRemove({ _id: id, userId })
    .then(result => {
      if (!result) {
        next();
      }
      res.status(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;
