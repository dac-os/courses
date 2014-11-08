var VError, router, nconf, slug, auth, Catalog;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Catalog = require('../models/catalog');

/**
 * @api {post} /catalogs Creates a new catalog.
 * @apiName createCatalog
 * @apiVersion 1.0.0
 * @apiGroup catalog
 * @apiPermission changeCatalog
 * @apiDescription
 * When creating a new catalog the user must send the catalog year. The catalog year is used for identifying and must be
 * unique in the system. If a existing year is sent to this method, a 409 error will be raised. And if no year is sent,
 * a 400 error will be raised.
 *
 * @apiParam {Number} year Catalog year.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required"
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
.route('/catalogs')
.post(auth.can('changeCatalog'))
.post(function createCatalog(request, response, next) {
  'use strict';

  var catalog;
  catalog = new Catalog({
    'year' : request.param('year')
  });
  return catalog.save(function createdCatalog(error) {
    if (error) {
      error = new VError(error, 'error creating catalog');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /catalogs List all system catalogs.
 * @apiName listCatalog
 * @apiVersion 1.0.0
 * @apiGroup catalog
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all catalogs in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (catalog) {Number} year Catalog year.
 * @apiSuccess (catalog) {Date} createdAt Catalog creation date.
 * @apiSuccess (catalog) {Date} updatedAt Catalog last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "year": 2014,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/catalogs')
.get(function listCatalog(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Catalog.find();
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedCatalog(error, catalogs) {
    if (error) {
      error = new VError(error, 'error finding catalogs');
      return next(error);
    }
    return response.status(200).send(catalogs);
  });
});

/**
 * @api {get} /catalogs/:catalog Get catalog information.
 * @apiName getCatalog
 * @apiVersion 1.0.0
 * @apiGroup catalog
 * @apiPermission none
 * @apiDescription
 * This method returns a single catalog details, the catalog year must be passed in the uri to identify the requested
 * catalog. If no catalog with the requested year was found, a 404 error will be raised.
 *
 * @apiSuccess {Number} year Catalog year.
 * @apiSuccess {Date} createdAt Catalog creation date.
 * @apiSuccess {Date} updatedAt Catalog last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "year": 2014,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/catalogs/:catalog')
.get(function getCatalog(request, response) {
  'use strict';

  var catalog;
  catalog = request.catalog;
  return response.status(200).send(catalog);
});

/**
 * @api {put} /catalogs/:catalog Updates catalog information.
 * @apiName updateCatalog
 * @apiVersion 1.0.0
 * @apiGroup catalog
 * @apiPermission changeCatalog
 * @apiDescription
 * When updating a catalog the user must send the catalog year. If a existing year which is not the original catalog
 * year is sent to this method, a 409 error will be raised. And if no year is sent, a 400 error will be raised. If no
 * catalog with the requested year was found, a 404 error will be raised.
 *
 * @apiParam {Number} year Catalog year.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "year": "required"
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
.route('/catalogs/:catalog')
.put(auth.can('changeCatalog'))
.put(function updateCatalog(request, response, next) {
  'use strict';

  var catalog;
  catalog = request.catalog;
  catalog.year = request.param('year');
  return catalog.save(function updatedCatalog(error) {
    if (error) {
      error = new VError(error, 'error updating catalog: "%s"', request.params.catalog);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /catalogs/:catalog Removes catalog.
 * @apiName removeCatalog
 * @apiVersion 1.0.0
 * @apiGroup catalog
 * @apiPermission changeCatalog
 * @apiDescription
 * This method removes a catalog from the system. If no catalog with the requested year was found, a 404 error will be
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
.route('/catalogs/:catalog')
.delete(auth.can('changeCatalog'))
.delete(function removeCatalog(request, response, next) {
  'use strict';

  var catalog;
  catalog = request.catalog;
  return catalog.remove(function removedCatalog(error) {
    if (error) {
      error = new VError(error, 'error removing catalog: "%s"', request.params.catalog);
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

module.exports = router;