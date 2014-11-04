var VError, mongoose, jsonSelect, nconf, Schema, async, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
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

schema.pre('save', function updateCascadeRequirement(next) {
  'use strict';

  async.waterfall([function (next) {
    var Requirement, query;
    Requirement = require('./requirement');
    query = Requirement.find();
    query.where('discipline').equals(this._id);
    query.exec(next);
  }.bind(this), function (requirements, next) {
    async.each(requirements, function (requirement, next) {
      requirement.disciplineCode = this.code;
      requirement.save(next);
    }.bind(this), next);
  }.bind(this)], next);
});

schema.pre('remove', function deleteCascadeRequirementAndOffering(next) {
  'use strict';

  async.parallel([function (next) {
    async.waterfall([function (next) {
      var Offering, query;
      Offering = require('./offering');
      query = Offering.find();
      query.where('discipline').equals(this._id);
      query.exec(next);
    }.bind(this), function (offerings, next) {
      async.each(offerings, function (offering, next) {
        offering.remove(next);
      }.bind(this), next);
    }.bind(this)], next);
  }.bind(this), function (next) {
    async.waterfall([function (next) {
      var Requirement, query;
      Requirement = require('./requirement');
      query = Requirement.find();
      query.where('discipline').equals(this._id);
      query.exec(next);
    }.bind(this), function (requirements, next) {
      async.each(requirements, function (requirement, next) {
        requirement.remove(next);
      }.bind(this), next);
    }.bind(this)], next);
  }.bind(this)], next);
});

module.exports = mongoose.model('Discipline', schema);
