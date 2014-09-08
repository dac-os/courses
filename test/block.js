/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Block, Modality, Catalog, Course;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
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

describe('block controller', function () {
  'use strict';

  before(Catalog.remove.bind(Catalog));
  before(Course.remove.bind(Course));
  before(Modality.remove.bind(Modality));

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
    request = request.post('/courses');
    request.set('csrf-token', 'adminToken');
    request.send({'code' : '43'});
    request.send({'name' : 'Ciencia da computação 2'});
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

  describe('create', function () {
    before(Block.remove.bind(Block));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeBlock permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'userToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2012/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/invalid/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'type' : 'required'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without type', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('type').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and type', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('type').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.expect(201);
      request.end(done);
    });

    describe('with code taken', function () {
      before(Block.remove.bind(Block));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Block.remove.bind(Block));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012/modalities/AA/blocks');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/invalid/blocks');
      request.expect(404);
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/AA/blocks');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (block) {
          block.should.have.property('code');
          block.should.have.property('type');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/AA/blocks');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(Block.remove.bind(Block));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012/modalities/AA/blocks/visao');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/invalid/blocks/visao');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/AA/blocks/invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/AA/blocks/visao');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('visao');
        response.body.should.have.property('type').be.equal('required');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(Block.remove.bind(Block));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/AA/blocks/visao');
      request.send({'code' : 'eng'});
      request.send({'type' : 'elet'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeBlock permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/AA/blocks/visao');
      request.set('csrf-token', 'userToken');
      request.send({'code' : 'eng'});
      request.send({'type' : 'elet'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2012/modalities/AA/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/invalid/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/AA/blocks/invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'eng'});
      request.send({'type' : 'elet'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/AA/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/AA/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'eng'});
      request.send({'type' : 'elet'});
      request.expect(200);
      request.end(done);
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'eng'});
        request.send({'type' : 'elet'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Block.remove.bind(Block));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/AA/blocks/visao');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeBlock permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/AA/blocks/visao');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2012/modalities/AA/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid modality code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/invalid/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/AA/blocks/invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/AA/blocks/visao');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});