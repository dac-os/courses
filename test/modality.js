/*globals describe, before, beforeEach, it, after*/
require('should');
var supertest, nock, nconf, app, Modality, Catalog, Course;

supertest = require('supertest');
app = require('../index.js');
nock = require('nock');
nconf = require('nconf');
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

describe('modality controller', function () {
  'use strict';

  before(Catalog.remove.bind(Catalog));
  before(Course.remove.bind(Course));

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

  describe('create', function () {
    before(Modality.remove.bind(Modality));

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeModality permission', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'userToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2012/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'course' : '42'});
      request.send({'name' : 'computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'course' : '42'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and name', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'course' : '42'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name and course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code, name and course', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should create', function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.expect(201);
      request.end(done);
    });

    describe('with code taken', function () {
      before(Modality.remove.bind(Modality));

      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'AA'});
        request.send({'name' : 'computação'});
        request.send({'course' : '42'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'AA'});
        request.send({'name' : 'computação'});
        request.send({'course' : '42'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('list', function () {
    before(Modality.remove.bind(Modality));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012/modalities');
      request.expect(404);
      request.end(done);
    });

    it('should list', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(1);
        response.body.every(function (modality) {
          modality.should.have.property('code');
          modality.should.have.property('course').with.property('code');
          modality.should.have.property('course').with.property('name');
          modality.should.have.property('course').with.property('level');
        });
      });
      request.end(done);
    });

    it('should return empty in second page', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities');
      request.send({'page' : 1});
      request.expect(200);
      request.expect(function (response) {
        response.body.should.be.instanceOf(Array).with.lengthOf(0);
      });
      request.end(done);
    });
  });

  describe('details', function () {
    before(Modality.remove.bind(Modality));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2012/modalities/AA');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/100-invalid');
      request.expect(404);
      request.end(done);
    });

    it('should show', function (done) {
      var request;
      request = supertest(app);
      request = request.get('/catalogs/2014/modalities/42-AA');
      request.expect(200);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('AA');
        response.body.should.have.property('course').with.property('code').be.equal(42);
        response.body.should.have.property('course').with.property('name').be.equal('Ciencia da computação');
        response.body.should.have.property('course').with.property('level').be.equal('GRAD');
      });
      request.end(done);
    });
  });

  describe('update', function () {
    before(Modality.remove.bind(Modality));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.send({'code' : 'AB'});
      request.send({'name' : 'computação'});
      request.send({'course' : '43'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeModality permission', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'userToken');
      request.send({'code' : 'AB'});
      request.send({'name' : 'computação'});
      request.send({'course' : '43'});
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2012/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AB'});
      request.send({'name' : 'computação'});
      request.send({'course' : '43'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/100-invalid');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AB'});
      request.send({'name' : 'computação'});
      request.send({'course' : '43'});
      request.expect(404);
      request.end(done);
    });

    it('should raise error without code', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'computação'});
      request.send({'course' : '43'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AB'});
      request.send({'course' : '43'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AB'});
      request.send({'name' : 'computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'name' : 'computação'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code and name', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'course' : '43'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without name and course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AB'});
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should raise error without code, name and course', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.expect(400);
      request.expect(function (response) {
        response.body.should.have.property('code').be.equal('required');
        response.body.should.have.property('name').be.equal('required');
        response.body.should.have.property('course').be.equal('required');
      });
      request.end(done);
    });

    it('should update', function (done) {
      var request;
      request = supertest(app);
      request = request.put('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AB'});
      request.send({'name' : 'computação'});
      request.send({'course' : '43'});
      request.expect(200);
      request.end(done);
    });

    describe('with code taken', function () {
      before(function (done) {
        var request;
        request = supertest(app);
        request = request.post('/catalogs/2014/modalities');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'AA'});
        request.send({'name' : 'computação'});
        request.send({'course' : '42'});
        request.end(done);
      });

      it('should raise error', function (done) {
        var request;
        request = supertest(app);
        request = request.put('/catalogs/2014/modalities/42-AA');
        request.set('csrf-token', 'adminToken');
        request.send({'code' : 'AB'});
        request.send({'name' : 'computação'});
        request.send({'course' : '43'});
        request.expect(409);
        request.end(done);
      });
    });
  });

  describe('delete', function () {
    before(Modality.remove.bind(Modality));

    before(function (done) {
      var request;
      request = supertest(app);
      request = request.post('/catalogs/2014/modalities');
      request.set('csrf-token', 'adminToken');
      request.send({'code' : 'AA'});
      request.send({'name' : 'computação'});
      request.send({'course' : '42'});
      request.end(done);
    });

    it('should raise error without token', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA');
      request.expect(403);
      request.end(done);
    });

    it('should raise error without changeModality permission', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'userToken');
      request.expect(403);
      request.end(done);
    });

    it('should raise error with invalid catalog code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2012/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should raise error with invalid code', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/100-invalid');
      request.set('csrf-token', 'adminToken');
      request.expect(404);
      request.end(done);
    });

    it('should delete', function (done) {
      var request;
      request = supertest(app);
      request = request.del('/catalogs/2014/modalities/42-AA');
      request.set('csrf-token', 'adminToken');
      request.expect(204);
      request.end(done);
    });
  });
});