/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Course;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
Course = require('../models/course');

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

describe('course controller', function () {
  'use strict';

  describe('create', function () {
    before(Course.remove.bind(Course));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeCourse permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'userToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'level' : 'GRAD'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without level', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('level').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'level' : 'GRAD'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and level', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'Ciencia da computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('level').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name and level', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('level').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code, name and level', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('level').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.expect(201);
      request.end(done);
    });

    describe('with code taken', function () {
      before(Course.remove.bind(Course));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/courses');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '42'});
        request.send({'name' : 'Ciencia da computação'});
        request.send({'level' : 'GRAD'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/courses');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '42'});
        request.send({'name' : 'Ciencia da computação'});
        request.send({'level' : 'GRAD'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Course.remove.bind(Course));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/courses');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (course) {
          course.should.have.property('code');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/courses');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(Course.remove.bind(Course));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/courses/invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/courses/42');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('42');
        response.body.should.have.property('name').be.equal('Ciencia da computação');
        response.body.should.have.property('level').be.equal('GRAD');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(Course.remove.bind(Course));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/courses/42');
      request.send({'code' : '43'});
      request.send({'name' : 'Ciencia da computação 2'});
      request.send({'level' : 'GRAD'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeCourse permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/courses/42');
      request.set('csrf-token', 'userToken');
      request.send({'code' : '43'});
      request.send({'name' : 'Ciencia da computação 2'});
      request.send({'level' : 'GRAD'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/courses/invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '43'});
      request.send({'name' : 'Ciencia da computação 2'});
      request.send({'level' : 'GRAD'});
      request.expect(404);
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/courses/42');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '43'});
      request.send({'name' : 'Ciencia da computação 2'});
      request.send({'level' : 'GRAD'});
      request.expect(200);
      request.end(done);
    });

    describe('with name taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/courses');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '42'});
        request.send({'name' : 'Ciencia da computação'});
        request.send({'level' : 'GRAD'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '43'});
        request.send({'name' : 'Ciencia da computação 2'});
        request.send({'level' : 'GRAD'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Course.remove.bind(Course));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/courses');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : '42'});
      request.send({'name' : 'Ciencia da computação'});
      request.send({'level' : 'GRAD'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/courses/42');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeCourse permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/courses/42');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/courses/invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/courses/42');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});