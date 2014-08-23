var VError, router, nconf, slug, auth, Discipline;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Discipline = require('../models/discipline');

/**
 * @api {post} /disciplines Creates a new discipline.
 * @apiName createDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission changeDiscipline
 * @apiDescription
 * When creating a new discipline the user must send the discipline code, name, credits, department and description. The
 * discipline code is used for identifying and must be unique in the system. If a existing code is sent to this method,
 * a 409 error will be raised. And if no code, or name or credits are sent, a 400 error will be raised.
 *
 * @apiParam {String} code Discipline code.
 * @apiParam {String} name Discipline name.
 * @apiParam {String} credits Discipline credits.
 * @apiParam {String} [department] Discipline department.
 * @apiParam {String} [description] Discipline description.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "name": "required",
 *   "credits": "required"
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
.route('/disciplines')
.post(auth.can('changeDiscipline'))
.post(function createDiscipline(request, response, next) {
  'use strict';

  var discipline;
  discipline = new Discipline({
    'code'        : slug(request.param('code', '')),
    'name'        : request.param('name'),
    'credits'     : request.param('credits'),
    'department'  : request.param('department'),
    'description' : request.param('description')
  });
  return discipline.save(function createdDiscipline(error) {
    if (error) {
      error = new VError(error, 'error creating discipline');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /disciplines List all system disciplines.
 * @apiName listDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all disciplines in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (discipline) {String} code Discipline code.
 * @apiSuccess (discipline) {String} name Discipline name.
 * @apiSuccess (discipline) {String} credits Discipline credits.
 * @apiSuccess (discipline) {String} [department] Discipline department.
 * @apiSuccess (discipline) {String} [description] Discipline description.
 * @apiSuccess (discipline) {Date} createdAt Discipline creation date.
 * @apiSuccess (discipline) {Date} updatedAt Discipline last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "code": "MC102",
 *   "name": "Programação de computadores",
 *   "credits": 6,
 *   "department": "IC",
 *   "description": "Programação de computadores",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/disciplines')
.get(function listDiscipline(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Discipline.find();
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedDiscipline(error, disciplines) {
    if (error) {
      error = new VError(error, 'error finding disciplines');
      return next(error);
    }
    return response.status(200).send(disciplines);
  });
});

/**
 * @api {get} /disciplines/:discipline Get discipline information.
 * @apiName getDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission none
 * @apiDescription
 * This method returns a single discipline details, the discipline code must be passed in the uri to identify the
 * requested discipline. If no discipline with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} code Discipline code.
 * @apiSuccess {String} name Discipline name.
 * @apiSuccess {String} credits Discipline credits.
 * @apiSuccess {String} [department] Discipline department.
 * @apiSuccess {String} [description] Discipline description.
 * @apiSuccess {Date} createdAt Discipline creation date.
 * @apiSuccess {Date} updatedAt Discipline last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "code": "MC102",
 *   "name": "Programação de computadores",
 *   "credits": 6,
 *   "department": "IC",
 *   "description": "Programação de computadores",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/disciplines/:discipline')
.get(function getDiscipline(request, response) {
  'use strict';

  var discipline;
  discipline = request.discipline;
  return response.status(200).send(discipline);
});

/**
 * @api {put} /disciplines/:discipline Updates discipline information.
 * @apiName updateDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission changeDiscipline
 * @apiDescription
 * When updating a discipline the user must send the discipline code, name, credits, department and description. If a
 * existing code which is not the original discipline code is sent to this method, a 409 error will be raised. And if no
 * code, or name or credits are sent, a 400 error will be raised. If no discipline with the requested code was found,
 * a 404 error will be raised.
 *
 * @apiParam {String} code Discipline code.
 * @apiParam {String} name Discipline name.
 * @apiParam {String} credits Discipline credits.
 * @apiParam {String} [department] Discipline department.
 * @apiParam {String} [description] Discipline description.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "name": "required",
 *   "credits": "required"
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
.route('/disciplines/:discipline')
.put(auth.can('changeDiscipline'))
.put(function updateDiscipline(request, response, next) {
  'use strict';

  var discipline;
  discipline = request.discipline;
  discipline.code = slug(request.param('code', ''));
  discipline.name = request.param('name');
  discipline.credits = request.param('credits');
  discipline.department = request.param('department');
  discipline.description = request.param('description');
  return discipline.save(function updatedDiscipline(error) {
    if (error) {
      error = new VError(error, 'error updating discipline: "%s"', request.params.discipline);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /disciplines/:discipline Removes discipline.
 * @apiName removeDiscipline
 * @apiVersion 1.0.0
 * @apiGroup discipline
 * @apiPermission changeDiscipline
 * @apiDescription
 * This method removes a discipline from the system. If no discipline with the requested code was found, a 404 error
 * will be raised.
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
.route('/disciplines/:discipline')
.delete(auth.can('changeDiscipline'))
.delete(function removeDiscipline(request, response, next) {
  'use strict';

  var discipline;
  discipline = request.discipline;
  return discipline.remove(function removedDiscipline(error) {
    if (error) {
      error = new VError(error, 'error removing discipline: "%s"', request.params.discipline);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('discipline', function findDiscipline(request, response, next, id) {
  'use strict';

  var query;
  query = Discipline.findOne();
  query.where('code').equals(id);
  query.exec(function foundDiscipline(error, discipline) {
    if (error) {
      error = new VError(error, 'error finding discipline: "%s"', discipline);
      return next(error);
    }
    if (!discipline) {
      return response.status(404).end();
    }
    request.discipline = discipline;
    return next();
  });
});

module.exports = router;