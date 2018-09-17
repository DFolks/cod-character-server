'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { TEST_DATABASE_URL, JWT_SECRET } = require('../config');

const { app } = require('../index');

const Character = require('../models/character');
const User = require('../models/user');

const seedCharacters = require('../db/characters');
const seedUsers = require('../db/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('CoD Characters API - Character', function() {
  before(function() {
    console.log(TEST_DATABASE_URL);
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  let user = {};
  let token;

  beforeEach(function() {
    return Promise.all([
      User.insertMany(seedUsers),
      Character.insertMany(seedCharacters),
      Character.createIndexes(),
      User.createIndexes()
    ]).then(([users]) => {
      user = users[0];
      token = jwt.sign({ user }, JWT_SECRET, { subject: user.username });
    });
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/character', function() {
    it('should return the correct number of characters', function() {
      return Promise.all([
        Character.find({ userId: user.id }),
        chai
          .request(app)
          .get('/api/character')
          .set('Authorization', `Bearer ${token}`)
      ]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(data.length);
      });
    });

    it('should return a list with the correct fields', function() {
      return Promise.all([
        Character.find({ userId: user.id }).sort('name'),
        chai
          .request(app)
          .get('/api/character')
          .set('Authorization', `Bearer ${token}`)
      ]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        res.body.forEach(function(item, i) {
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'id',
            'name',
            'userId',
            'createdAt',
            'updatedAt'
          );
          expect(item.id).to.equal(data[i].id);
          expect(item.name).to.equal(data[i].name);
          expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
          expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
        });
      });
    });
  });

  describe('GET /api/character/:id', function() {
    it('should return correct character', function() {
      let data;
      return Character.findOne()
        .then(_data => {
          data = _data;
          return chai
            .request(app)
            .get(`/api/character/${data.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.an('object');
          expect(res.body).to.have.keys(
            'id',
            'name',
            'userId',
            'createdAt',
            'updatedAt',
            'age',
            'aspirations',
            'attributes',
            'chronicle',
            'combatBlock',
            'concept',
            'conditions',
            'faction',
            'group',
            'health',
            'integrity',
            'merits',
            'skills',
            'vice',
            'virtue',
            'willpower'
          );
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      return chai
        .request(app)
        .get('/api/character/NOT-VALID')
        .set('Authorization', `Bearer ${token}`)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });

    it('should respond with a 404 for an id that does not exist', function() {
      return chai
        .request(app)
        .get('/api/character/DEOSNOTEXIST')
        .set('Authorization', `Bearer ${token}`)
        .then(res => expect(res).to.have.status(404));
    });
  });

  describe('POST /api/character', function() {
    it('should create and return a new chracter when provided valid data', function() {
      const newCharacter = {
        name: 'Miscellaneous',
        attributes: {
          mental: {
            intelligence: 1,
            wits: 1,
            resolve: 1
          },
          physical: {
            strength: 1,
            dexterity: 1,
            stamina: 1
          },
          social: {
            presence: 1,
            manipulation: 1,
            composure: 1
          }
        },
        skills: {
          mental: {
            academics: 1,
            computers: 1,
            crafts: 1,
            medicine: 1,
            occult: 1,
            politics: 1,
            science: 1
          },
          physical: {
            athletics: 1,
            brawl: 1,
            drive: 1,
            firearms: 1,
            larcenry: 1,
            stealth: 1,
            survival: 1,
            weaponry: 1
          },
          social: {
            animalKen: 1,
            empathy: 1,
            expression: 1,
            intimidation: 1,
            persuasion: 1,
            socialize: 1,
            streetwise: 1,
            subterfuge: 1
          }
        },
        combatBlock: {
          size: 5
        },
        age: 23,
        player: 'TestPlayer',
        virtue: 'Fortitude',
        vice: 'Gluttony',
        concept: 'Test Dummy',
        chronicle: 'Test Chronicle',
        faction: 'Test Faction',
        group: 'Test group',
        userId: '5b9d6d35f482f24cfc4a0880'
      };

      let res;
      return chai
        .request(app)
        .post('/api/character')
        .set('Authorization', `Bearer ${token}`)
        .send(newCharacter)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'id',
            'name',
            'userId',
            'createdAt',
            'updatedAt',
            'age',
            'aspirations',
            'attributes',
            'chronicle',
            'combatBlock',
            'concept',
            'player',
            'conditions',
            'faction',
            'group',
            'health',
            'integrity',
            'merits',
            'skills',
            'vice',
            'virtue',
            'willpower'
          );
          return Character.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.name).to.equal(data.name);
          expect(new Date(res.body.createdAt)).to.eql(data.createdAt);
          expect(new Date(res.body.updatedAt)).to.eql(data.updatedAt);
        });
    });

    it('should return an error when missing "name" field', function() {
      const newCharacter = {};
      return chai
        .request(app)
        .post('/api/character')
        .set('Authorization', `Bearer ${token}`)
        .send(newCharacter)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing `name` in request body');
        });
    });
  });

  describe('PATCH /api/character/:id', function() {
    it('should find and update a character when given valid data', function() {
      const updateCharacter = { name: 'Test Update Name' };

      let character;
      return Character.findOne()
        .then(_character => {
          character = _character;
          return chai
            .request(app)
            .patch(`/api/character/${character.id}`)
            .set('Authorization', `Bearer ${token}`)
            .send(updateCharacter);
        })
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.keys(
            'id',
            'name',
            'userId',
            'createdAt',
            'updatedAt',
            'age',
            'aspirations',
            'attributes',
            'chronicle',
            'combatBlock',
            'concept',
            'conditions',
            'faction',
            'group',
            'health',
            'integrity',
            'merits',
            'skills',
            'vice',
            'virtue',
            'willpower'
          );
          expect(res.body.id).to.equal(character.id);
          expect(res.body.name).to.equal(updateCharacter.name);
          expect(new Date(res.body.createdAt)).to.eql(character.createdAt);
          expect(new Date(res.body.updatedAt)).to.greaterThan(
            character.updatedAt
          );
        });
    });

    it('should respond with status 400 and an error message when `id` is not valid', function() {
      const updateCharacter = { name: 'I\'m an updated character' };

      return chai
        .request(app)
        .patch('/api/character/NOT-VALID')
        .set('Authorization', `Bearer ${token}`)
        .send(updateCharacter)
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  });

  describe('DELETE /api/character/:id', function() {
    it.only('should delete an existing character and respond with a 204 status', function() {
      let character;
      return Character.findOne()
        .then(_character => {
          character = _character;
          return chai
            .request(app)
            .delete(`/api/character/${character.id}`)
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(204);
          console.log(character.id);
          return Character.count({ _id: character.id });
        })
        .then(count => {
          console.log(count);
          expect(count).to.equal(0);
        });
    });

    it('should return an error with an invalid Id', function() {
      let character;
      return Character.findOne()
        .then(_character => {
          character = _character;
          return chai
            .request(app)
            .delete('/api/character/Not-Valid')
            .set('Authorization', `Bearer ${token}`);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res.body.message).to.equal('The `id` is not valid');
        });
    });
  });
});
