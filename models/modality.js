var VError, mongoose, jsonSelect, nconf, Schema, async, schema;

VError = require('verror');
mongoose = require('mongoose');
jsonSelect = require('mongoose-json-select');
nconf = require('nconf');
async = require('async');
Schema = mongoose.Schema;

schema = new Schema({
  'code'        : {
    'type'     : String,
    'required' : true
  },
  'courseCode'  : {
    'type'     : Number,
    'required' : true
  },
  'creditLimit' : {
    'type'     : Number,
    'required' : true
  },
  'name'        : {
    'type'     : String,
    'required' : true
  },
  'course'      : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Course',
    'required' : true
  },
  'catalog'     : {
    'type'     : Schema.ObjectId,
    'ref'      : 'Catalog',
    'required' : true
  },
  'createdAt'   : {
    'type'    : Date,
    'default' : Date.now
  },
  'updatedAt'   : {
    'type' : Date
  }
}, {
  'collection' : 'modalities',
  'strict'     : true,
  'toJSON'     : {
    'virtuals' : true
  }
});

schema.index({
  'code'       : 1,
  'courseCode' : 1,
  'catalog'    : 1
}, {
  'unique' : true
});

schema.plugin(jsonSelect, {
  '_id'         : 0,
  'code'        : 1,
  'name'        : 1,
  'courseCode'  : 0,
  'course'      : 1,
  'catalog'     : 0,
  'creditLimit' : 1,
  'createdAt'   : 1,
  'updatedAt'   : 1
});

schema.pre('save', function setModalityUpdatedAt(next) {
  'use strict';

  this.updatedAt = new Date();
  next();
});

schema.pre('remove', function deleteCascadeBlocks (next) {
  'use strict';

  async.waterfall([function (next) {
    var Block, query;
    Block = require('./block');
    query = Block.find();
    query.where('modality').equals(this._id);
    query.exec(next);
  }.bind(this), function (blocks, next) {
    async.each(blocks, function (block, next) {
      block.remove(next);
    }, next);
  }], next);
});

module.exports = mongoose.model('Modality', schema);