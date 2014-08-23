var VError, router, nconf, slug, auth, Course;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Course = require('../models/course');

/**
 * @api {post} /courses Creates a new course.
 * @apiName createCourse
 * @apiVersion 1.0.0
 * @apiGroup course
 * @apiPermission changeCourse
 * @apiDescription
 * When creating a new course the user must send the course code, name and level. The course code is used for
 * identifying and must be unique in the system. If a existing code is sent to this method, a 409 error will be raised.
 * And if no code, or name or level  is sent, a 400 error will be raised.
 *
 * @apiParam {String} code Course code.
 * @apiParam {String} name Course name.
 * @apiParam {String} level Course level.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required",
 *   "name": "required",
 *   "level": "required"
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
.route('/courses')
.post(auth.can('changeCourse'))
.post(function createCourse(request, response, next) {
  'use strict';

  var course;
  course = new Course({
    'code'  : slug(request.param('code', '')),
    'name'  : request.param('name'),
    'level' : request.param('level')
  });
  return course.save(function createdCourse(error) {
    if (error) {
      error = new VError(error, 'error creating course');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /courses List all system courses.
 * @apiName listCourse
 * @apiVersion 1.0.0
 * @apiGroup course
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all courses in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (course) {String} code Course code.
 * @apiSuccess (course) {String} name Course name.
 * @apiSuccess (course) {String} level Course level.
 * @apiSuccess (course) {Date} createdAt Course creation date.
 * @apiSuccess (course) {Date} updatedAt Course last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "code": "42",
 *   "name": "Ciencia da computação",
 *   "level": "GRAD",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/courses')
.get(function listCourse(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Course.find();
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedCourse(error, courses) {
    if (error) {
      error = new VError(error, 'error finding courses');
      return next(error);
    }
    return response.status(200).send(courses);
  });
});

/**
 * @api {get} /courses/:course Get course information.
 * @apiName getCourse
 * @apiVersion 1.0.0
 * @apiGroup course
 * @apiPermission none
 * @apiDescription
 * This method returns a single course details, the course code must be passed in the uri to identify the requested
 * course. If no course with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} code Course code.
 * @apiSuccess {String} name Course name.
 * @apiSuccess {String} level Course level.
 * @apiSuccess {Date} createdAt Course creation date.
 * @apiSuccess {Date} updatedAt Course last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "code": "42",
 *   "name": "Ciencia da computação",
 *   "level": "GRAD",
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/courses/:course')
.get(function getCourse(request, response) {
  'use strict';

  var course;
  course = request.course;
  return response.status(200).send(course);
});

/**
 * @api {put} /courses/:course Updates course information.
 * @apiName updateCourse
 * @apiVersion 1.0.0
 * @apiGroup course
 * @apiPermission changeCourse
 * @apiDescription
 * When updating a course the user must send the course code, name and level. If a existing code which is not the
 * original course code is sent to this method, a 409 error will be raised. And if no code, or name or level is sent, a
 * 400 error will be raised. If no course with the requested code was found, a 404 error will be raised.
 *
 * @apiParam {String} code Course code.
 * @apiParam {String} name Course name.
 * @apiParam {String} level Course level.
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
 *   "level": "required"
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
.route('/courses/:course')
.put(auth.can('changeCourse'))
.put(function updateCourse(request, response, next) {
  'use strict';

  var course;
  course = request.course;
  course.code = slug(request.param('code'));
  course.name = request.param('name', '');
  course.level = request.param('level', '');
  return course.save(function updatedCourse(error) {
    if (error) {
      error = new VError(error, 'error updating course: "%s"', request.params.course);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /courses/:course Removes course.
 * @apiName removeCourse
 * @apiVersion 1.0.0
 * @apiGroup course
 * @apiPermission changeCourse
 * @apiDescription
 * This method removes a course from the system. If no course with the requested code was found, a 404 error will be
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
.route('/courses/:course')
.delete(auth.can('changeCourse'))
.delete(function removeCourse(request, response, next) {
  'use strict';

  var course;
  course = request.course;
  return course.remove(function removedCourse(error) {
    if (error) {
      error = new VError(error, 'error removing course: "%s"', request.params.course);
      return next(error);
    }
    return response.status(204).end();
  });
});

router.param('course', function findCourse(request, response, next, id) {
  'use strict';

  var query;
  query = Course.findOne();
  query.where('code').equals(id);
  query.exec(function foundCourse(error, course) {
    if (error) {
      error = new VError(error, 'error finding course: "%s"', course);
      return next(error);
    }
    if (!course) {
      return response.status(404).end();
    }
    request.course = course;
    return next();
  });
});

module.exports = router;