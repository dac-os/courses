var express, mongoose, nconf, bodyParser,
app;

express = require('express');
mongoose = require('mongoose');
nconf = require('nconf');
bodyParser = require('body-parser');

nconf.argv();
nconf.env();
nconf.defaults(require('./config'));

mongoose.connect(nconf.get('MONGOHQ_URL'));

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended' : true}));
app.use(function handleErrors(error, request, response, next) {
  'use strict';

  var errors, prop;
  if (error && error.cause && error.cause()) {
      if (error.cause().code === 11000) {
          return response.send(409);
      }
      if (error.cause().errors) {
          errors = {};
          for (prop in error.cause().errors) {
              if (error.cause().errors.hasOwnProperty(prop)) {
                  errors[prop] = error.cause().errors[prop].type;
              }
          }
          return response.send(400, errors);
      }
  }
  console.error(error);
  return response.send(500);
});
app.listen(nconf.get('PORT'));
app.get('/', function pingSuccess(request, response) {
  'use strict';
  
  response.send(200);
});

module.exports = app;
