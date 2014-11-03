var VError, router, nconf, slug, auth, Modality, Catalog, Course;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Modality = require('../models/modality');
Catalog = require('../models/catalog');
Course = require('../models/course');

router.use(function (request, response, next) {
  'use strict';

  var courseId, query;
  courseId = request.param('course');
  if (!courseId) {
    return next();
  }
  query = Course.findOne();
  query.where('code').equals(courseId);
  return query.exec(function (error, course) {
    if (error) {
      error = new VError(error, 'error finding course: "%s"', courseId);
      return next(error);
    }
    request.course = course;
    return next();
  })
});

/**
 * @api {post} /catalogs/:catalog/modalities Creates a new modality.
 * @apiName createModality
 * @apiVersion 1.0.0
 * @apiGroup modality
 * @apiPermission changeModality
 * @apiDescription
 * When creating a new modality the user must send the modality code, name, course and creditLimit. The modality code
 * is used for identifying and must be unique in the catalog. If a existing code is sent to this method, a 409 error
 * will be raised. And if no code, or name or course is sent, a 400 error will be raised.
 *
 * @apiParam {String} code Modality code.
 * @apiParam {String} name Modality name.
 * @apiParam {String} course Modality course code.
 * @apiParam {Number} creditLimit Modality creditLimit.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "name": "required",
 *   "course": "required"
 *   "creditLimit": "required"
 * }
 *
 * @apiErrorExample
 * HTTP/1.1 403 Forbidden
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
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
.route('/catalogs/:catalog/modalities')
.post(auth.can('changeModality'))
.post(function createModality(request, response, next) {
  'use strict';

  var modality;
  modality = new Modality({
    'code'        : slug(request.param('code', '')),
    'name'        : request.param('name'),
    'courseCode'  : request.course ? request.course.code : null,
    'course'      : request.course,
    'catalog'     : request.catalog,
    'creditLimit' : request.param('creditLimit')
  });
  return modality.save(function createdModality(error) {
    if (error) {
      error = new VError(error, 'error creating modality');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /catalogs/:catalog/modalities List all system modalities.
 * @apiName listModality
 * @apiVersion 1.0.0
 * @apiGroup modality
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all modalities in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (modality) {String} code Modality code.
 * @apiSuccess (modality) {Number} creditLimit Modality creditLimit.
 * @apiSuccess (modality) {String} name Modality name.
 * @apiSuccess (modality) {Date} createdAt Modality creation date.
 * @apiSuccess (modality) {Date} updatedAt Modality last update date.
 * @apiSuccess (course) {String} code Course code.
 * @apiSuccess (course) {String} name Course name.
 * @apiSuccess (course) {String} level Course level.
 * @apiSuccess (course) {Date} createdAt Course creation date.
 * @apiSuccess (course) {Date} updatedAt Course last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "code": "AA",
 *   "creditLimit": 30,
 *   "name": "Ciencia da computação",
 *   "course": {
 *     "code": "42",
 *     "name": "Ciencia da computação",
 *     "level": "GRAD",
 *     "createdAt": "2014-07-01T12:22:25.058Z",
 *     "updatedAt": "2014-07-01T12:22:25.058Z"
 *   },
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/catalogs/:catalog/modalities')
.get(function listModality(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Modality.find();
  query.where('catalog').equals(request.catalog._id);
  query.populate('course');
  query.populate('catalog');
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedModality(error, modalities) {
    if (error) {
      error = new VError(error, 'error finding modalities');
      return next(error);
    }
    return response.status(200).send(modalities);
  });
});

/**
 * @api {get} /catalogs/:catalog/modalities/:modality Get modality information.
 * @apiName getModality
 * @apiVersion 1.0.0
 * @apiGroup modality
 * @apiPermission none
 * @apiDescription
 * This method returns a single modality details, the modality code must be passed in the uri to identify the requested
 * modality. If no modality with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} code Modality code.
 * @apiSuccess {Number} creditLimit Modality creditLimit.
 * @apiSuccess (modality) {String} name Modality name.
 * @apiSuccess {Date} createdAt Modality creation date.
 * @apiSuccess {Date} updatedAt Modality last update date.
 * @apiSuccess (course) {String} code Course code.
 * @apiSuccess (course) {String} name Course name.
 * @apiSuccess (course) {String} level Course level.
 * @apiSuccess (course) {Date} createdAt Course creation date.
 * @apiSuccess (course) {Date} updatedAt Course last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "code": "AA",
 *   "name": "Ciencia da computação",
 *   "course": {
 *     "code": "42",
 *     "name": "Ciencia da computação",
 *     "level": "GRAD",
 *     "createdAt": "2014-07-01T12:22:25.058Z",
 *     "updatedAt": "2014-07-01T12:22:25.058Z"
 *   },
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/catalogs/:catalog/modalities/:modality')
.get(function getModality(request, response) {
  'use strict';

  var modality;
  modality = request.modality;
  return response.status(200).send(modality);
});

/**
 * @api {put} /catalogs/:catalog/modalities/:modality Updates modality information.
 * @apiName updateModality
 * @apiVersion 1.0.0
 * @apiGroup modality
 * @apiPermission changeModality
 * @apiDescription
 * When updating a modality the user must send the modality code, name, course and creditLimit. If a existing code which
 * is not the original modality code is sent to this method, a 409 error will be raised. And if no code, or name or
 * course, or creditLimit is sent, a 400 error will be raised. If no modality with the requested code was found, a 404 error will be raised.
 *
 * @apiParam {String} code Modality code.
 * @apiParam {String} name Modality name.
 * @apiParam {String} course Modality course code.
 * @apiParam {Number} creditLimit Modality creditLimit.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "creditLimit": "required"
 *   "name": "required",
 *   "course": "required"
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
.route('/catalogs/:catalog/modalities/:modality')
.put(auth.can('changeModality'))
.put(function updateModality(request, response, next) {
  'use strict';

  var modality;
  modality = request.modality;
  modality.code = slug(request.param('code', ''));
  modality.name = request.param('name');
  modality.course = request.course;
  modality.courseCode = request.course ? request.course.code : null;
  modality.creditLimit = request.param('creditLimit');
  return modality.save(function updatedModality(error) {
    if (error) {
      error = new VError(error, 'error updating modality: ""', request.params.modality);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /catalogs/:catalog/modalities/:modality Removes modality.
 * @apiName removeModality
 * @apiVersion 1.0.0
 * @apiGroup modality
 * @apiPermission changeModality
 * @apiDescription
 * This method removes a modality from the system. If no modality with the requested code was found, a 404 error will be
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
.route('/catalogs/:catalog/modalities/:modality')
.delete(auth.can('changeModality'))
.delete(function removeModality(request, response, next) {
  'use strict';

  var modality;
  modality = request.modality;
  return modality.remove(function removedModality(error) {
    if (error) {
      error = new VError(error, 'error removing modality: ""', request.params.modality);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('catalog', function findCatalog(request, response, next, id) {
  'use strict';

  var query;
  query = Catalog.findOne();
  query.where('year').equals(id);
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

module.exports = router;