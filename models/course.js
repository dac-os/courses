var VError, mongoose, jsonSelect, nconf, Schema, async, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
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

schema.pre('save', function updateCascadeModality(next) {
  'use strict';

  async.waterfall([function (next) {
    var Modality, query;
    Modality = require('./modality');
    query = Modality.find();
    query.where('course').equals(this._id);
    query.exec(next);
  }.bind(this), function (modalities, next) {
    async.each(modalities, function (modality, next) {
      modality.courseCode = this.code;
      modality.save(next);
    }.bind(this), next);
  }.bind(this)], next);
});

schema.pre('remove', function deleteCascadeModality(next) {
  'use strict';

  async.waterfall([function (next) {
    var Modality, query;
    Modality = require('./modality');
    query = Modality.find();
    query.where('course').equals(this._id);
    query.exec(next);
  }.bind(this), function (modalities, next) {
    async.each(modalities, function (modality, next) {
      modality.remove(next);
    }.bind(this), next);
  }.bind(this)], next);
});

module.exports = mongoose.model('Course', schema);