/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Requirement, Block, Modality, Catalog, Course;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
Requirement = require('../models/requirement');
Block = require('../models/block');
Modality = require('../models/modality');
Catalog = require('../models/catalog');
Course = require('../models/course');

nock(nconf.get('AUTH_URI'), {
  'reqheaders' : {'csrf-token' : 'adminToken'}
}).get('/users/me').times(Infinity).reply(200, {
  'academicRegistry' : '111111',
  'profile'          : {
    'name'        : 'admin',
    'slug'        : 'admin',
    'permissions' : ['changeCourse', 'changeDiscipline', 'changeCatalog', 'changeModality', 'changeBlock', 'changeOffering', 'changeRequirement']
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

describe('requirement controller', function () {
  'use strict';

  before(Catalog.remove.bind(Catalog));
  before(Course.remove.bind(Course));
  before(Modality.remove.bind(Modality));
  before(Block.remove.bind(Block));

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/catalogs');
    request.set('csrf-token', 'adminToken');
    request.send({'year' : 2014});
    request.end(done);
  });

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

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/catalogs/2014/modalities');
    request.set('csrf-token', 'adminToken');
    request.send({'code' : 'AA'});
    request.send({'course' : '42'});
    request.end(done);
  });

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/catalogs/2014/modalities/42-AA/blocks');
    request.set('csrf-token', 'adminToken');
    request.send({'code' : 'visao'});
    request.send({'type' : 'required'});
    request.end(done);
  });

  before(function (done) {
    var request;
    request = supertest(app);
    request = request.post('/disciplines');
    request.set('csrf-token', 'adminToken');
    request.send({'code' : 'MC001'});
    request.send({'name' : 'Fundamentos de programação'});
    request.send({'credits' : 6});
    request.send({'department' : 'IC'});
    request.send({'description' : 'Fundamentos de programação'});
    request.end(done);
  });

  describe('create', function () {
    before(Requirement.remove.bind(Requirement));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.send({'discipline' : 'MC001'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeRequirement permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'userToken');
      request.send({'discipline' : 'MC001'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2012/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/invalid/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid block', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/invalid/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.expect(404);
      request.end(done);
    });

    it('should create with mask', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.expect(201);
      request.end(done);
    });

    it('should create with discipline', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.expect(201);
      request.end(done);
    });

    describe('with code taken', function () {
      before(Requirement.remove.bind(Requirement));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC001'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC001'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Requirement.remove.bind(Requirement));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.end(done);
    });

    it('should raise error with invalid catalog', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012/modalities/42-AA/blocks/visao/requirements');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/invalid/blocks/visao/requirements');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid block', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/invalid/requirements');
      request.expect(404);
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (requirement) {
          requirement.should.have.property('discipline');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(Requirement.remove.bind(Requirement));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.end(done);
    });

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012/modalities/42-AA/blocks/visao/requirements/MC001');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/invalid/blocks/visao/requirements/MC001');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid blockcode', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/invalid/requirements/MC001');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show with discipline', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('discipline');
      });
      request.end(done);
    });

    it('should show with mask', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC---');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('mask');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(Requirement.remove.bind(Requirement));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.send({'mask' : 'MC---'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeRequirement permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'userToken');
      request.send({'mask' : 'MC---'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2012/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/invalid/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid block code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA/blocks/invalid/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without discipline and mask', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.send({'mask' : 'MC---'});
      request.expect(200);
      request.end(done);
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
        request.set('csrf-token', 'adminToken');
        request.send({'discipline' : 'MC001'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
        request.set('csrf-token', 'adminToken');
        request.send({'mask' : 'MC---'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Requirement.remove.bind(Requirement));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks/visao/requirements');
      request.set('csrf-token', 'adminToken');
      request.send({'discipline' : 'MC001'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeRequirement permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2012/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/invalid/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid block code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA/blocks/invalid/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao/requirements/MC001');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});