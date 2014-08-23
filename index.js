var express, mongoose, nconf, bodyParser, auth,
app;

express = require('express');
mongoose = require('mongoose');
nconf = require('nconf');
bodyParser = require('body-parser');
auth = require('dacos-auth-driver');

nconf.argv();
nconf.env();
nconf.defaults(require('./config'));

mongoose.connect(nconf.get('MONGOHQ_URL'));
auth.configUri(nconf.get('AUTH_URI'));

app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({'extended' : true}));
app.use(auth.session());
app.use(function (request, response, next) {
  'use strict';

  response.header('Content-Type', 'application/json');
  response.header('Content-Encoding', 'UTF-8');
  response.header('Content-Language', 'en');
  response.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  response.header('Pragma', 'no-cache');
  response.header('Expires', '0');
  response.header('Access-Control-Allow-Origin', '*');
  response.header('Access-Control-Allow-Methods', request.get('Access-Control-Request-Method'));
  response.header('Access-Control-Allow-Headers', request.get('Access-Control-Request-Headers'));
  next();
});
app.use(require('./controllers/course'));
app.use(require('./controllers/discipline'));
app.use(function handleErrors(error, request, response, next) {
  'use strict';

  var errors, prop;
  if (error && error.cause && error.cause()) {
    if (error.cause().code === 11000) {
      return response.status(409).end();
    }
    if (error.cause().errors) {
      errors = {};
      for (prop in error.cause().errors) {
        if (error.cause().errors.hasOwnProperty(prop)) {
          errors[prop] = error.cause().errors[prop].type;
        }
      }
      return response.status(400).send(errors);
    }
  }
  console.error(error);
  response.status(500).end();
  return process.exit();
});
app.get('/', function pingSuccess(request, response) {
  'use strict';

  response.status(200).end();
});
app.listen(nconf.get('PORT'));

module.exports = app;