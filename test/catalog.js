/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Catalog;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
Catalog = require('../models/catalog');

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

describe('catalog controller', function () {
  'use strict';

  describe('create', function () {
    before(Catalog.remove.bind(Catalog));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.send({'year' : 2014});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeCatalog permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.set('csrf-token', 'userToken');
      request.send({'year' : 2014});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without year', function (done) {
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

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.expect(201);
      request.end(done);
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

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2014});
      request.end(done);
    });

    it('should list', function (done) {
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

    it('should raise error with invalid year', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012');
      request.expect(404);
      request.end(done);
    });

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

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014');
      request.send({'year' : 2015});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeCatalog permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014');
      request.set('csrf-token', 'userToken');
      request.send({'year' : 2015});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid year', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2012');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without year', function (done) {
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

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014');
      request.set('csrf-token', 'adminToken');
      request.send({'year' : 2015});
      request.expect(200);
      request.end(done);
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

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeCatalog permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid year', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2012');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});