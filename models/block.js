var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'code'      : {
    'type'     : String,
    'required' : true,
    'unique'   : true
  },
  'modality'  : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Modality',
    'required' : true
  },
  'type'      : {
    'type'     : String,
    'required' : true
  },
  'credits'   : {
    'type'     : Number
  },
  'createdAt' : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt' : {
    'type' : Date
  }
}, {
  'collection' : 'blocks',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'code'     : 1,
  'modality' : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'       : 0,
  'code'      : 1,
  'modality'  : 0,
  'type'      : 1,
  'credits'   : 1,
  'createdAt' : 1,
  'updatedAt' : 1
});

schema.pre('save', function setBlockUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Block', schema);