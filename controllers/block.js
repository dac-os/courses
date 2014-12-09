var VError, router, nconf, slug, auth, Block, Modality, Catalog;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
async = require('async');
Block = require('../models/block');
Modality = require('../models/modality');
Catalog = require('../models/catalog');

/**
 * @api {post} /catalogs/:catalog/modalities/:modality/blocks Creates a new block.
 * @apiName createBlock
 * @apiVersion 1.0.0
 * @apiGroup block
 * @apiPermission changeBlock
 * @apiDescription
 * When creating a new block the user must send the block code, type and credits. The block code is used for identifying
 * and must be unique in the system. If a existing code is sent to this method, a 409 error will be raised. And if no
 * code or type is sent, a 400 error will be raised.
 *
 * @apiParam {String} code Block code.
 * @apiParam {String} type Block type.
 * @apiParam {Number} [credits] Block credits.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "type": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 201 Created
 * {}
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks')
.post(auth.can('changeBlock'))
.post(function createBlock(request, response, next) {
  'use strict';

  var block;
  block = new Block({
    'code'     : slug(request.param('code', '')),
    'type'     : request.param('type'),
    'credits'  : request.param('credits'),
    'modality' : request.modality
  });
  return block.save(function createdBlock(error) {
    if (error) {
      error = new VError(error, 'error creating block');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /catalogs/:catalog/modalities/:modality/blocks List all system blocks.
 * @apiName listBlock
 * @apiVersion 1.0.0
 * @apiGroup block
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all blocks in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (block) {String} code Block code.
 * @apiSuccess (block) {String} type Block type.
 * @apiSuccess (block) {Number} [credits] Block credits.
 * @apiSuccess (block) {Date} createdAt Block creation date.
 * @apiSuccess (block) {Date} updatedAt Block last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "code": "visao",
 *   "type": "required",
 *   "credits": "6",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks')
.get(function listBlock(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Block.find();
  query.where('modality').equals(request.modality._id);
  if (request.param('filterByType')) query.where('type').equals(request.param('filterByType'));
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedBlock(error, blocks) {
    if (error) {
      error = new VError(error, 'error finding blocks');
      return next(error);
    }
    return response.status(200).send(blocks);
  });
});

/**
 * @api {get} /catalogs/:catalog/modalities/:modality/blocks/:block Get block information.
 * @apiName getBlock
 * @apiVersion 1.0.0
 * @apiGroup block
 * @apiPermission none
 * @apiDescription
 * This method returns a single block details, the block code must be passed in the uri to identify the requested
 * block. If no block with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} code Block code.
 * @apiSuccess {String} type Block type.
 * @apiSuccess {NUmber} [credits] Block credits.
 * @apiSuccess {Date} createdAt Block creation date.
 * @apiSuccess {Date} updatedAt Block last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "code": "visao",
 *   "type": "required",
 *   "credits": "6",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks/:block')
.get(function getBlock(request, response) {
  'use strict';

  var block;
  block = request.block;
  return response.status(200).send(block);
});

/**
 * @api {put} /catalogs/:catalog/modalities/:modality/blocks/:block Updates block information.
 * @apiName updateBlock
 * @apiVersion 1.0.0
 * @apiGroup block
 * @apiPermission changeBlock
 * @apiDescription
 * When updating a block the user must send the block code, type and credits. If a existing code which is not the
 * original block code is sent to this method, a 409 error will be raised. And if no code or type is sent, a 400 error
 * will be raised. If no block with the requested code was found, a 404 error will be raised.
 *
 * @apiParam {String} code Block code.
 * @apiParam {String} type Block type.
 * @apiParam {Number} [credits] Block credits.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "type": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 409 Conflict
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 Ok
 * {}
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks/:block')
.put(auth.can('changeBlock'))
.put(function updateBlock(request, response, next) {
  'use strict';

  var block;
  block = request.block;
  block.code = slug(request.param('code', ''));
  block.type = request.param('type');
  return block.save(function updatedBlock(error) {
    if (error) {
      error = new VError(error, 'error updating block: ""', request.params.block);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /catalogs/:catalog/modalities/:modality/blocks/:block Removes block.
 * @apiName removeBlock
 * @apiVersion 1.0.0
 * @apiGroup block
 * @apiPermission changeBlock
 * @apiDescription
 * This method removes a block from the system. If no block with the requested code was found, a 404 error will be
 * raised.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 204 No Content
 * {}
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks/:block')
.delete(auth.can('changeBlock'))
.delete(function removeBlock(request, response, next) {
  'use strict';

  var block;
  block = request.block;
  return block.remove(function removedBlock(error) {
    if (error) {
      error = new VError(error, 'error removing block: ""', request.params.block);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('catalog', function findCatalog(request, response, next, id) {
  'use strict';

  var query;
  query = Catalog.findOne();
  query.where('year').equals(isNaN(id) ? 0 : id);
  query.exec(function foundCatalog(error, catalog) {
    if (error) {
      error = new VError(error, 'error finding catalog: "%s"', catalog);
      return next(error);
    }
    if (!catalog) {
      return response.status(404).end();
    }
    request.catalog = catalog;
    return next();
  });
});

router.param('modality', function findModality(request, response, next, id) {
  'use strict';

  var query, code;
  code = id.split('-');
  query = Modality.findOne();
  query.where('courseCode').equals(code[0]);
  query.where('code').equals(code[1]);
  query.where('catalog').equals(request.catalog._id);
  query.populate('course');
  query.populate('catalog');
  query.exec(function foundModality(error, modality) {
    if (error) {
      error = new VError(error, 'error finding modality: ""', modality);
      return next(error);
    }
    if (!modality) {
      return response.status(404).end();
    }
    request.modality = modality;
    return next();
  });
});

router.param('block', function findBlock(request, response, next, id) {
  'use strict';

  var query;
  query = Block.findOne();
  query.where('code').equals(id);
  query.where('modality').equals(request.modality._id);
  query.exec(function foundBlock(error, block) {
    if (error) {
      error = new VError(error, 'error finding block: ""', block);
      return next(error);
    }
    if (!block) {
      return response.status(404).end();
    }
    request.block = block;
    return next();
  });
});

module.exports = router;