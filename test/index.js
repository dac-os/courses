/*globals describe, before, it, after*/
require('should');
var supertest, app;

supertest = require('supertest');
app = require('../index.js');

it('should raise server', function (done) {
  'use strict';

  var request;
  request = supertest(app);
  request = request.get('/');
  request.expect(200);
  request.end(done);
});