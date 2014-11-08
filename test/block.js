/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, app, Block, Modality, Catalog, Course;

supertest = require('supertest');
app = require('../index.js');
Block = require('../models/block');
Modality = require('../models/modality');
Catalog = require('../models/catalog');
Course = require('../models/course');

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
    request.send({'name' : 'Ciencia da computação'});
    request.send({'course' : '42'});
    request.send({'creditLimit' : 30});
    request.end(done);
  });

  describe('create', function () {
    before(Block.remove.bind(Block));

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeBlock permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'userToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid catalog code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2012/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid modality code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/100-invalid/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'type' : 'required'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without type', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('type').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and type', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('type').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, code and type', function () {
      it('should create', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.expect(201);
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(Block.remove.bind(Block));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
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

    describe('without valid catalog code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2012/modalities/42-AA/blocks');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid modality code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/100-invalid/blocks');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with one in database', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.end(done);
      });

      it('should list 1 in first page', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/42-AA/blocks');
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
        request = request.get('/catalogs/2014/modalities/42-AA/blocks');
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
    before(Block.remove.bind(Block));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    describe('without valid catalog code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2012/modalities/42-AA/blocks/visao');
        request.expect(404);
        request.end(done);
      });

    });

    describe('without valid modality code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/100-invalid/blocks/visao');
        request.expect(404);
        request.end(done);
      });

    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/42-AA/blocks/invalid');
        request.expect(404);
        request.end(done);
      });

    });

    describe('with valid code', function () {
      it('should show', function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('visao');
          response.body.should.have.property('type').be.equal('required');
        });
        request.end(done);
      });
    });
  });

  describe('update', function () {
    before(Block.remove.bind(Block));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities/42-AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.send({'code' : 'eng'});
        request.send({'type' : 'elet'});
        request.expect(403);
        request.end(done);
      });

    });

    describe('without changeBlock permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'userToken');
        request.send({'code' : 'eng'});
        request.send({'type' : 'elet'});
        request.expect(403);
        request.end(done);
      });

    });

    describe('without valid catalog code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2012/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid modality code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/100-invalid/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/invalid');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'eng'});
        request.send({'type' : 'elet'});
        request.expect(404);
        request.end(done);
      });
    });

    describe('without code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.send({'type' : 'elet'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without type', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'eng'});
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('type').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('without code and type', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.expect(400);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('required');
          response.body.should.have.property('type').be.equal('required');
        });
        request.end(done);
      });
    });

    describe('with valid credentials, code and type', function () {
      it('should update', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'eng'});
        request.send({'type' : 'elet'});
        request.expect(200);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.expect(404);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/42-AA/blocks/eng');
        request.expect(200);
        request.expect(function (response) {
          response.body.should.have.property('code').be.equal('eng');
          response.body.should.have.property('type').be.equal('elet');
        });
        request.end(done);
      });
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities/42-AA/blocks');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'visao'});
        request.send({'type' : 'required'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA/blocks/visao');
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
      request = request.post('/catalogs/2014/modalities/42-AA/blocks');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'visao'});
      request.send({'type' : 'required'});
      request.end(done);
    });

    describe('without token', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without changeBlock permission', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'userToken');
        request.expect(403);
        request.end(done);
      });
    });

    describe('without valid catalog code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2012/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid modality code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014/modalities/100-invalid/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('without valid code', function () {
      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014/modalities/42-AA/blocks/invalid');
        request.set('csrf-token', 'adminToken');
        request.expect(404);
        request.end(done);
      });
    });

    describe('with valid credentials and code', function () {
      it('should delete', function (done) {
        var request;
        request = supertest(app);
        request = request.del('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.set('csrf-token', 'adminToken');
        request.expect(204);
        request.end(done);
      });

      after(function (done) {
        var request;
        request = supertest(app);
        request = request.get('/catalogs/2014/modalities/42-AA/blocks/visao');
        request.expect(404);
        request.end(done);
      });
    });
  });
});