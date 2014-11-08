/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Catalog;

supertest = require('supertest');
app = require('../index.js');
Catalog = require('../models/catalog');

describe('catalog controller', function () {
  'use strict';

  describe('create', function () {
    before(Catalog.remove.bind(Catalog));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.send({'year' : 2014});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'userToken');
        request.send({'year' : 2014});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials and year', function () {
      it('should create', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.expect(201);
        request.end(done);
      });
    });

    describe('with year taken', function () {
      before(Catalog.remove.bind(Catalog));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Catalog.remove.bind(Catalog));

    describe('with one in database', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.end(done);
      });

      it('should list 1 in first page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.be.instanceOf(Array).with.lengthOf(1);
          response.body.every(function (catalog) {
            catalog.should.have.property('year');
          });
        });
        request.end(done);
      });

      it('should return empty in second page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs');
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
    before(Catalog.remove.bind(Catalog));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    describe('without valid year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2012');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid year', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal(2014);
        });
        request.end(done);
      });
    });
  });

  describe('update', function () {
    before(Catalog.remove.bind(Catalog));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014');
        request.send({'year' : 2015});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCatalog permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014');
        request.set('csrf-token', 'userToken');
        request.send({'year' : 2015});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2012');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials year', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014');
        request.expect(404);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2015');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('year').be.equal(2015);
        });
        request.end(done);
      });
    });

    describe('with year taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2014});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014');
        request.set('csrf-token', 'adminToken');
        request.send({'year' : 2015});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Catalog.remove.bind(Catalog));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeCatalog permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid year', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2012');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and slug', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014');
        request.expect(404);
        request.end(done);
      });
    });
  });
});