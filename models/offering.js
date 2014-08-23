var VError, mongoose, jsonSelect, nconf, Schema, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
Schema = mongoose.Schema;

schema = new Schema({
  'code'       : {
    'type'     : String,
    'required' : true
  },
  'discipline' : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Discipline',
    'required' : true
  },
  'year'       : {
    'type'     : Number,
    'required' : true
  },
  'period'     : {
    'type'     : String,
    'required' : true
  },
  'schedules'  : [
    {
      'weekday' : {
        'type'     : Number,
        'required' : true
      },
      'hour'    : {
        'type'     : Number,
        'required' : true
      },
      'room'    : {
        'type' : String
      }
    }
  ],
  'createdAt'  : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'  : {
    'type' : Date
  }
}, {
  'collection' : 'offerings',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'code'       : 1,
  'discipline' : 1,
  'year'       : 1,
  'period'     : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'        : 0,
  'code'       : 1,
  'discipline' : 0,
  'year'       : 1,
  'period'     : 1,
  'schedules'  : 1,
  'createdAt'  : 1,
  'updatedAt'  : 1
});

schema.pre('save', function setOfferingUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Offering', schema);