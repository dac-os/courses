var VError, router, nconf, slug, auth, Offering, Discipline;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Offering = require('../models/offering');
Discipline = require('../models/discipline');

/**
 * @api {post} /disciplines/:discipline/offerings Creates a new offering.
 * @apiName createOffering
 * @apiVersion 1.0.0
 * @apiGroup offering
 * @apiPermission changeOffering
 * @apiDescription
 * When creating a new offering the user must send the offering code, year, period and schedules. The offering code is
 * used for identifying and must be unique in the year's period for each discipline. If a existing code is sent to this
 * method, a 409 error will be raised. And if no code, or year or period is sent, a 400 error will be raised. The
 * schedules vector contains the weekday, hour and room of each class of the offering
 *
 * @apiParam {String} code Offering code.
 * @apiParam {Number} year Offering year.
 * @apiParam {String} period Offering period.
 * @apiParam (schedules) {String} weekday Offering scheduled weekday.
 * @apiParam (schedules) {String} hour Offering scheduled hour.
 * @apiParam (schedules) {String} room Offering scheduled room.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "year": "required",
 *   "period": "required"
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
.route('/disciplines/:discipline/offerings')
.post(auth.can('changeOffering'))
.post(function createOffering(request, response, next) {
  'use strict';

  var offering;
  offering = new Offering({
    'code'       : slug(request.param('code', '')),
    'year'       : request.param('year'),
    'period'     : request.param('period'),
    'schedules'  : request.param('schedules'),
    'discipline' : request.discipline
  });
  return offering.save(function createdOffering(error) {
    if (error) {
      error = new VError(error, 'error creating offering');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /disciplines/:discipline/offerings List all system offerings.
 * @apiName listOffering
 * @apiVersion 1.0.0
 * @apiGroup offering
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all offerings in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (offering) {String} code Offering code.
 * @apiSuccess (offering) {Number} year Offering year.
 * @apiSuccess (offering) {String} period Offering period.
 * @apiSuccess (offering) {Date} createdAt Offering creation date.
 * @apiSuccess (offering) {Date} updatedAt Offering last update date.
 * @apiSuccess (schedules) {String} weekday Offering scheduled weekday.
 * @apiSuccess (schedules) {String} hour Offering scheduled hour.
 * @apiSuccess (schedules) {String} room Offering scheduled room.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "code": "A",
 *   "year": 2014,
 *   "period": "1",
 *   "schedules": [
 *     "weekday" : 1,
 *     "hour" : 19,
 *     "room" : "IC302",
 *   ],
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/disciplines/:discipline/offerings')
.get(function listOffering(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Offering.find();
  query.where('discipline').equals(request.discipline._id);
  query.populate('discipline');
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedOffering(error, offerings) {
    if (error) {
      error = new VError(error, 'error finding offerings');
      return next(error);
    }
    return response.status(200).send(offerings);
  });
});

/**
 * @api {get} /disciplines/:discipline/offerings/:offering Get offering information.
 * @apiName getOffering
 * @apiVersion 1.0.0
 * @apiGroup offering
 * @apiPermission none
 * @apiDescription
 * This method returns a single offering details, the offering code must be passed in the uri to identify the requested
 * offering. If no offering with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} code Offering code.
 * @apiSuccess {Number} year Offering year.
 * @apiSuccess {String} period Offering period.
 * @apiSuccess {Date} createdAt Offering creation date.
 * @apiSuccess {Date} updatedAt Offering last update date.
 * @apiSuccess (schedules) {String} weekday Offering scheduled weekday.
 * @apiSuccess (schedules) {String} hour Offering scheduled hour.
 * @apiSuccess (schedules) {String} room Offering scheduled room.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "code": "A",
 *   "year": 2014,
 *   "period": "1",
 *   "schedules": [
 *     "weekday" : 1,
 *     "hour" : 19,
 *     "room" : "IC302",
 *   ],
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/disciplines/:discipline/offerings/:offering')
.get(function getOffering(request, response) {
  'use strict';

  var offering;
  offering = request.offering;
  return response.status(200).send(offering);
});

/**
 * @api {put} /disciplines/:discipline/offerings/:offering Updates offering information.
 * @apiName updateOffering
 * @apiVersion 1.0.0
 * @apiGroup offering
 * @apiPermission changeOffering
 * @apiDescription
 * When updating a offering the user must send the offering code, year, period and schedules. If a existing code which
 * is not the original offering code is sent to this method, a 409 error will be raised. And if no code, or year or
 * period is sent, a 400 error will be raised. If no offering with the requested code was found, a 404 error will be
 * raised.
 *
 * @apiParam {String} code Offering code.
 * @apiParam {Number} year Offering year.
 * @apiParam {String} period Offering period.
 * @apiParam (schedules) {String} weekday Offering scheduled weekday.
 * @apiParam (schedules) {String} hour Offering scheduled hour.
 * @apiParam (schedules) {String} room Offering scheduled room.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "year": "required",
 *   "period": "required"
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
.route('/disciplines/:discipline/offerings/:offering')
.put(auth.can('changeOffering'))
.put(function updateOffering(request, response, next) {
  'use strict';

  var offering;
  offering = request.offering;
  offering.code = slug(request.param('code', ''));
  offering.year = request.param('year');
  offering.period = request.param('period');
  offering.schedules = request.param('schedules');
  return offering.save(function updatedOffering(error) {
    if (error) {
      error = new VError(error, 'error updating offering: ""', request.params.offering);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /disciplines/:discipline/offerings/:offering Removes offering.
 * @apiName removeOffering
 * @apiVersion 1.0.0
 * @apiGroup offering
 * @apiPermission changeOffering
 * @apiDescription
 * This method removes a offering from the system. If no offering with the requested code was found, a 404 error will be
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
.route('/disciplines/:discipline/offerings/:offering')
.delete(auth.can('changeOffering'))
.delete(function removeOffering(request, response, next) {
  'use strict';

  var offering;
  offering = request.offering;
  return offering.remove(function removedOffering(error) {
    if (error) {
      error = new VError(error, 'error removing offering: ""', request.params.offering);
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

router.param('offering', function findOffering(request, response, next, id) {
  'use strict';

  var query, code;
  code = id.split('-');
  query = Offering.findOne();
  query.where('discipline').equals(request.discipline._id);
  query.where('year').equals(code[0]);
  query.where('period').equals(code[1]);
  query.where('code').equals(code[2]);
  query.populate('discipline');
  query.exec(function foundOffering(error, offering) {
    if (error) {
      error = new VError(error, 'error finding offering: ""', offering);
      return next(error);
    }
    if (!offering) {
      return response.status(404).end();
    }
    request.offering = offering;
    return next();
  });
});

module.exports = router;