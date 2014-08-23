var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'year'      : {
    'type'     : Number,
    'required' : true,
    'unique'   : true
  },
  'createdAt' : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt' : {
    'type' : Date
  }
}, {
  'collection' : 'catalogs',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.plugin(jsonSelect, {
  '_id'       : 0,
  'year'      : 1,
  'createdAt' : 1,
  'updatedAt' : 1
});

schema.pre('save', function setCatalogUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Catalog', schema);