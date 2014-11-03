var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'code'      : {
    'type'     : Number,
    'required' : true,
    'unique'   : true
  },
  'name'      : {
    'type'     : String,
    'required' : true
  },
  'level'     : {
    'type'     : String,
    'required' : true
  },
  'createdAt' : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt' : {
    'type' : Date
  }
}, {
  'collection' : 'courses',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.plugin(jsonSelect, {
  '_id'       : 0,
  'code'      : 1,
  'name'      : 1,
  'level'     : 1,
  'createdAt' : 1,
  'updatedAt' : 1
});

schema.pre('save', function setCourseUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Course', schema);