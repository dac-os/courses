var VError, mongoose, jsonSelect, nconf, Schema, async, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
Schema = mongoose.Schema;

schema = new Schema({
  'disciplineCode'    : {
    'type'     : String,
    'required' : true
  },
  'block'             : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Block',
    'required' : true
  },
  'suggestedSemester' : {
    'type' : String
  },
  'mask'              : {
    'type' : String
  },
  'discipline'        : {
    'type' : Schema.ObjectId,
    'ref'  : 'Discipline'
  },
  'createdAt'         : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'         : {
    'type' : Date
  }
}, {
  'collection' : 'requirements',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'disciplineCode' : 1,
  'block'          : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'               : 0,
  'code'              : 0,
  'block'             : 0,
  'suggestedSemester' : 1,
  'mask'              : 1,
  'discipline'        : 1,
  'createdAt'         : 1,
  'updatedAt'         : 1
});

schema.pre('save', function setRequirementUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Requirement', schema);