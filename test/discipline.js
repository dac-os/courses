/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Discipline;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
Discipline = require('../models/discipline');

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'adminToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111111',
  'profile'          : {
    'name'        : 'admin',
    'slug'        : 'admin',
    'permissions' : ['changeCourse', 'changeDiscipline', 'changeCatalog', 'changeModality', 'changeBlock', 'changeOffering']
  }
});

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'userToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111112',
  'profile'          : {
    'name'        : 'user',
    'slug'        : 'user',
    'permissions' : []
  }
});

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'undefined'}
}).get('/users/me').times(Infinity).reply(404, {});

describe('discipline controller', function () {
  'use strict';

  describe('create', function () {
    before(Discipline.remove.bind(Discipline));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeDiscipline permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'userToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'credits' : 6});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without credits', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('credits').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'credits' : 6});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and credits', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'Programação de computadores'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('credits').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name and credits', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('credits').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code, name and credits', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('credits').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(201);
      request.end(done);
    });

    describe('with code taken', function () {
      before(Discipline.remove.bind(Discipline));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'MC102'});
        request.send({'name' : 'Programação de computadores'});
        request.send({'credits' : 6});
        request.send({'department' : 'IC'});
        request.send({'description' : 'Programação de computadores'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'MC102'});
        request.send({'name' : 'Programação de computadores'});
        request.send({'credits' : 6});
        request.send({'department' : 'IC'});
        request.send({'description' : 'Programação de computadores'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/disciplines');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (discipline) {
          discipline.should.have.property('code');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/disciplines');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/disciplines/invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/disciplines/MC102');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('MC102');
        response.body.should.have.property('name').be.equal('Programação de computadores');
        response.body.should.have.property('credits').be.equal(6);
        response.body.should.have.property('department').be.equal('IC');
        response.body.should.have.property('description').be.equal('Programação de computadores');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/disciplines/MC102');
      request.send({'code' : 'MC103'});
      request.send({'name' : 'Programação de computadores 2'});
      request.send({'credits' : 8});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeDiscipline permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/disciplines/MC102');
      request.set('csrf-token', 'userToken');
      request.send({'code' : 'MC103'});
      request.send({'name' : 'Programação de computadores 2'});
      request.send({'credits' : 8});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/disciplines/invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC103'});
      request.send({'name' : 'Programação de computadores 2'});
      request.send({'credits' : 8});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/disciplines/MC102');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/disciplines/MC102');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC103'});
      request.send({'name' : 'Programação de computadores 2'});
      request.send({'credits' : 8});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.expect(200);
      request.end(done);
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'MC102'});
        request.send({'name' : 'Programação de computadores'});
        request.send({'credits' : 6});
        request.send({'department' : 'IC'});
        request.send({'description' : 'Programação de computadores'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'MC103'});
        request.send({'name' : 'Programação de computadores 2'});
        request.send({'credits' : 8});
        request.send({'department' : 'IC'});
        request.send({'description' : 'Programação de computadores'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Discipline.remove.bind(Discipline));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'MC102'});
      request.send({'name' : 'Programação de computadores'});
      request.send({'credits' : 6});
      request.send({'department' : 'IC'});
      request.send({'description' : 'Programação de computadores'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/disciplines/MC102');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeDiscipline permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/disciplines/MC102');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/disciplines/invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/disciplines/MC102');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});