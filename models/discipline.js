var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'code'         : {
    'type'     : String,
    'required' : true,
    'unique'   : true
  },
  'name'         : {
    'type'     : String,
    'required' : true
  },
  'credits'      : {
    'type'     : Number,
    'required' : true
  },
  'department'   : {
    'type' : String
  },
  'description'  : {
    'type' : String
  },
  'requirements' : [
    {
      'type'     : Schema.ObjectId,
      'ref'      : 'Discipline',
      'required' : true
    }
  ],
  'createdAt'    : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'    : {
    'type' : Date
  }
}, {
  'collection' : 'disciplines',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.plugin(jsonSelect, {
  '_id'          : 0,
  'code'         : 1,
  'name'         : 1,
  'credits'      : 1,
  'department'   : 1,
  'description'  : 1,
  'requirements' : 1,
  'createdAt'    : 1,
  'updatedAt'    : 1
});

schema.pre('save', function setDisciplineUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Discipline', schema);