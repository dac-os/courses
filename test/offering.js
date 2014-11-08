/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Offering, Discipline;

supertest = require('supertest');
app = require('../index.js');
Offering = require('../models/offering');
Discipline = require('../models/discipline');

describe('offering controller', function () {
  'use strict';

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

  describe('create', function () {
    before(Offering.remove.bind(Offering));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeOffering permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'userToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid discipline code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/invalid/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy and code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy and year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'period' : '1'});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('period').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code, year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, code and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, code and year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'period' : '1'});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, code, year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, vacancy, code, year and period', function () {
      it('should create', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(201);
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(Offering.remove.bind(Offering));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Offering.remove.bind(Offering));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines/MC102/offerings');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'A'});
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'vacancy' : 30});
      request.send({'schedules' : [
        {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
      ]});
      request.end(done);
    });

    describe('without valid discipline code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/invalid/offerings');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with one in database', function () {
      it('should list 1 in first page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(1);
          response.body.every(function (offering) {
            offering.should.have.property('code');
            offering.should.have.property('year');
            offering.should.have.property('period');
            offering.should.have.property('schedules');
          });
        });
        request.end(done);
      });

      it('should return empty in second page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings');
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
    before(Offering.remove.bind(Offering));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines/MC102/offerings');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'A'});
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'vacancy' : 30});
      request.send({'schedules' : [
        {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
      ]});
      request.end(done);
    });

    describe('without valid discipline code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/invalid/offerings/2014-1-A');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings/2014-invalid');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid code', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings/2014-1-A');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('A');
          response.body.should.have.property('year').be.equal(2014);
          response.body.should.have.property('period').be.equal('1');
        });
        request.end(done);
      });
    });
  });

  describe('update', function () {
    before(Offering.remove.bind(Offering));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines/MC102/offerings');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'A'});
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'vacancy' : 30});
      request.send({'schedules' : [
        {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
      ]});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeOffering permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'userToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid discipline code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/invalid/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without invalid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-invalid');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy and code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('code').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy and year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'period' : '2'});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2013});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code, year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'vacancy' : 30});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, code and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2013});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, code and year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'period' : '2'});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without vacancy, code, year and period', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('vacancy').be.equal('required');
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('year').be.equal('required');
          response.body.should.have.property('period').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, vacancy, code, year and period', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings/2014-1-A');
        request.expect(404);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings/2013-2-B');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('B');
          response.body.should.have.property('year').be.equal(2013);
          response.body.should.have.property('period').be.equal('2');
        });
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/disciplines/MC102/offerings');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'A'});
        request.send({'year' : 2014});
        request.send({'period' : '1'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
        ]});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'B'});
        request.send({'year' : 2013});
        request.send({'period' : '2'});
        request.send({'vacancy' : 30});
        request.send({'schedules' : [
          {'weekday' : 2, 'hour' : 17, 'room' : 'B'}
        ]});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Offering.remove.bind(Offering));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/disciplines/MC102/offerings');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'A'});
      request.send({'year' : 2014});
      request.send({'period' : '1'});
      request.send({'vacancy' : 30});
      request.send({'schedules' : [
        {'weekday' : 1, 'hour' : 19, 'room' : 'A'}
      ]});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/disciplines/MC102/offerings/2014-1-A');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeOffering permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid discipline code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/disciplines/invalid/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/disciplines/MC102/offerings/2014-invalid');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and code', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/disciplines/MC102/offerings/2014-1-A');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/disciplines/MC102/offerings/2014-1-A');
        request.expect(404);
        request.end(done);
      });
    });
  });
});