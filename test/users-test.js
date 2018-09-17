'use strict';

const { app } = require('../index');
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const { TEST_DATABASE_URL } = require('../config');

const User = require('../models/user');

const expect = chai.expect;
chai.use(chaiHttp);

describe('CoD Characters API - Users', function() {
  const username = 'exampleUser';
  const password = 'examplePass';
  const name = 'Example User';

  before(function() {
    return mongoose
      .connect(TEST_DATABASE_URL)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return User.createIndexes();
  });

  afterEach(function() {
    return mongoose.connection.db.dropDatabase();
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('/api/user', function() {
    describe('POST', function() {
      it('Should create a new user', function() {
        const testUser = { username, password, name };

        let res;
        return chai
          .request(app)
          .post('/api/user')
          .send(testUser)
          .then(_res => {
            res = _res;
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('id', 'username', 'name');

            expect(res.body.id).to.exist;
            expect(res.body.username).to.equal(testUser.username);
            expect(res.body.name).to.equal(testUser.name);

            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.exist;
            expect(user.id).to.equal(res.body.id);
            expect(user.name).to.equal(testUser.name);
            return user.validatePassword(password);
          })
          .then(isValid => {
            expect(isValid).to.be.true;
          });
      });
      it('Should reject users with missing username', function() {
        const testUser = { password, name };
        return chai
          .request(app)
          .post('/api/user')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Missing \'username\' in request body'
            );
          });
      });
      it('Should reject users with missing password', function() {
        const testUser = { username, name };
        return chai
          .request(app)
          .post('/api/user')
          .send(testUser)
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Missing \'password\' in request body'
            );
          });
      });
      it('Should reject users with non-string username', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username: 1234,
            password,
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'username\' must be type String'
            );
          });
      });
      it('Should reject users with non-string password', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username,
            password: 1234,
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' must be type String'
            );
          });
      });
      it('Should reject users with non-trimmed username', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username: ` ${username} `,
            password,
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'username\' cannot start or end with whitespace'
            );
          });
      });
      it('Should reject users with non-trimmed password', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username,
            password: ` ${password} `,
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' cannot start or end with whitespace'
            );
          });
      });
      it('Should reject users with empty username', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username: '',
            password,
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'username\' must be at least 1 characters long'
            );
          });
      });
      it('Should reject users with password less than 6 characters', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username,
            password: '12345',
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' must be at least 6 characters long'
            );
          });
      });
      it('Should reject users with password greater than 72 characters', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            name
          })
          .then(res => {
            expect(res).to.have.status(422);
            expect(res).to.be.json;
            expect(res.body).to.be.a('object');
            expect(res.body.message).to.equal(
              'Field: \'password\' must be at most 72 characters long'
            );
          });
      });
      it('Should reject users with duplicate username', function() {
        // Create an initial user
        return User.create({
          username,
          password,
          name
        })
          .then(() =>
            // Try to create a second user with the same username
            chai
              .request(app)
              .post('/api/user')
              .send({
                username,
                password,
                name
              })
          )
          .then(res => {
            expect(res).to.have.status(400);
            expect(res).to.be.json;
            expect(res).to.be.a('object');
            expect(res.body.message).to.equal('The username already exists');
          });
      });
      it('Should trim fullname', function() {
        return chai
          .request(app)
          .post('/api/user')
          .send({
            username,
            password,
            name: ` ${name} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys('username', 'name', 'id');
            expect(res.body.username).to.equal(username);
            expect(res.body.name).to.equal(name);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.name).to.equal(name);
          });
      });
    });
  });
});
