/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Course;

supertest = require('supertest');
app = require('../index.js');
Course = require('../models/course');

describe('course controller', function () {
  'use strict';

  describe('create', function () {
    before(Course.remove.bind(Course));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/courses');
        request.send({'code' : '42'});
        request.send({'name' : 'Ciencia da computação'});
        request.send({'level' : 'GRAD'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCourse permission', function () {
      it('should raise error', function (done) {
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
    });

    describe('without code', function () {
      it('should raise error', function (done) {
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
    });

    describe('without name', function () {
      it('should raise error', function (done) {
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
    });

    describe('without level', function () {
      it('should raise error', function (done) {
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
    });

    describe('without code and name', function () {
      it('should raise error', function (done) {
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
    });

    describe('without code and level', function () {
      it('should raise error', function (done) {
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
    });

    describe('without name and level', function () {
      it('should raise error', function (done) {
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
    });

    describe('without code, name and level', function () {
      it('should raise error', function (done) {
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
    });

    describe('with valid credentials, code, name and level', function () {
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

    describe('with one in database', function () {
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

      it('should list 1 in first page', function (done) {
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

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/courses/100');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid slug', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/courses/42');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal(42);
          response.body.should.have.property('name').be.equal('Ciencia da computação');
          response.body.should.have.property('level').be.equal('GRAD');
        });
        request.end(done);
      });
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

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.send({'code' : '43'});
        request.send({'name' : 'Ciencia da computação 2'});
        request.send({'level' : 'GRAD'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCourse permission', function () {
      it('should raise error', function (done) {
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
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/100');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '43'});
        request.send({'name' : 'Ciencia da computação 2'});
        request.send({'level' : 'GRAD'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'name' : 'Ciencia da computação 2'});
        request.send({'level' : 'GRAD 2'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without name', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '43'});
        request.send({'level' : 'GRAD 2'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('name').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without level', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '42'});
        request.send({'name' : 'Ciencia da computação 2'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('level').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and name', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'level' : 'GRAD 2'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('name').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and level', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'name' : 'Ciencia da computação 2'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('level').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without name and level', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '43'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('name').be.equal('required');
          response.body.should.have.property('level').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code, name and level', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('name').be.equal('required');
          response.body.should.have.property('level').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, code, name and level', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : '43'});
        request.send({'name' : 'Ciencia da computação 2'});
        request.send({'level' : 'GRAD 2'});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/courses/42');
        request.expect(404);
        request.end(done);
      })

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/courses/43');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal(43);
          response.body.should.have.property('name').be.equal('Ciencia da computação 2');
          response.body.should.have.property('level').be.equal('GRAD 2');
        });
        request.end(done);
      });
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

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/courses/42');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCourse permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/courses/42');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/courses/100');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and code', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/courses/42');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/courses/42');
        request.expect(404);
        request.end(done);
      });
    });
  });
});