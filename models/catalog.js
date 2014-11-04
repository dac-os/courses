var VError, mongoose, jsonSelect, nconf, Schema, async, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
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

schema.pre('remove', function deleteCascadeModality(next) {
  'use strict';

  async.waterfall([function (next) {
    var Modality, query;
    Modality = require('./modality');
    query = Modality.find();
    query.where('catalog').equals(this._id);
    query.exec(next);
  }.bind(this), function (modalities, next) {
    async.each(modalities, function (modality, next) {
      modality.remove(next);
    }, next);
  }], next);
});

module.exports = mongoose.model('Catalog', schema);