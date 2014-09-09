var VError, router, nconf, slug, auth, Requirement, Block, Modality, Catalog, Discipline;

VError = require('verror');
router = require('express').Router();
nconf = require('nconf');
slug = require('slug');
auth = require('dacos-auth-driver');
Requirement = require('../models/requirement');
Block = require('../models/block');
Modality = require('../models/modality');
Catalog = require('../models/catalog');
Discipline = require('../models/discipline');

router.use(function (request, response, next) {
  'use strict';

  var disciplineId, query;
  disciplineId = request.param('discipline');
  if (!disciplineId) {
    return next();
  }
  query = Discipline.findOne();
  query.where('code').equals(disciplineId);
  return query.exec(function (error, discipline) {
    if (error) {
      error = new VError(error, 'error finding discipline: "%s"', disciplineId);
      return next(error);
    }
    request.discipline = discipline;
    return next();
  })
});

/**
 * @api {post} /catalogs/:catalog/modalities/:modality/blocks/:block/requirements Creates a new requirement.
 * @apiName createRequirement
 * @apiVersion 1.0.0
 * @apiGroup requirement
 * @apiPermission changeRequirement
 * @apiDescription
 * When creating a new requirement the user must send the requirement suggestedSemester, discipline and mask. The
 * requirement code is used for identifying and must be unique in the system. If a existing code is sent to this method,
 * a 409 error will be raised. And if no discipline or mask is sent, a 400 error will be raised.
 *
 * @apiParam {String} discipline Requirement discipline code.
 * @apiParam {String} mask Requirement discipline mask.
 * @apiParam {Number} suggestedSemester Requirement suggested semester.
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required"
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
.route('/catalogs/:catalog/modalities/:modality/blocks/:block/requirements')
.post(auth.can('changeRequirement'))
.post(function createRequirement(request, response, next) {
  'use strict';

  var requirement;
  requirement = new Requirement({
    'code'              : request.discipline ? request.discipline.code : request.param('mask', ''),
    'block'             : request.block._id,
    'suggestedSemester' : request.param('suggestedSemester'),
    'mask'              : request.param('mask'),
    'discipline'        : request.discipline ? request.discipline._id : null
  });
  return requirement.save(function createdRequirement(error) {
    if (error) {
      error = new VError(error, 'error creating requirement');
      return next(error);
    }
    return response.status(201).end();
  });
});

/**
 * @api {get} /catalogs/:catalog/modalities/:modality/blocks/:block/requirements List all system requirements.
 * @apiName listRequirement
 * @apiVersion 1.0.0
 * @apiGroup requirement
 * @apiPermission none
 * @apiDescription
 * This method returns an array with all requirements in the database. The data is returned in pages of length 20. If no
 * page is passed, the system will assume the requested page is page 0, otherwise the desired page must be sent.
 *
 * @apiParam {[Number=0]} page Requested page.
 *
 * @apiSuccess (requirement) {String} mask Requirement discipline mask.
 * @apiSuccess (requirement) {Number} suggestedSemester Requirement suggested semester.
 * @apiSuccess (requirement) {Date} createdAt Requirement creation date.
 * @apiSuccess (requirement) {Date} updatedAt Requirement last update date.
 *
 * @apiSuccess (discipline) {String} code Discipline code.
 * @apiSuccess (discipline) {String} name Discipline name.
 * @apiSuccess (discipline) {String} credits Discipline credits.
 * @apiSuccess (discipline) {String} [department] Discipline department.
 * @apiSuccess (discipline) {String} [description] Discipline description.
 * @apiSuccess (discipline) {Array} [requirements] Discipline requirements.
 * @apiSuccess (discipline) {Date} createdAt Discipline creation date.
 * @apiSuccess (discipline) {Date} updatedAt Discipline last update date.
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * [{
 *   "discipline": {
 *     "code": "MC001",
 *     "name": "Fundamentos de computação",
 *     "credits": 6,
 *     "department": "IC",
 *     "description": "Fundamentos de computação",
 *     "createdAt": "2014-07-01T12:22:25.058Z",
 *     "updatedAt": "2014-07-01T12:22:25.058Z"
 *   },
 *   "suggestedSemester": 2,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }]
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks/:block/requirements')
.get(function listRequirement(request, response, next) {
  'use strict';

  var pageSize, page, query;
  pageSize = nconf.get('PAGE_SIZE');
  page = request.param('page', 0) * pageSize;
  query = Requirement.find();
  query.where('block').equals(request.block._id);
  query.populate('discipline');
  query.skip(page);
  query.limit(pageSize);
  return query.exec(function listedRequirement(error, requirements) {
    if (error) {
      error = new VError(error, 'error finding requirements');
      return next(error);
    }
    return response.status(200).send(requirements);
  });
});

/**
 * @api {get} /catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement Get requirement information.
 * @apiName getRequirement
 * @apiVersion 1.0.0
 * @apiGroup requirement
 * @apiPermission none
 * @apiDescription
 * This method returns a single requirement details, the requirement code must be passed in the uri to identify the requested
 * requirement. If no requirement with the requested code was found, a 404 error will be raised.
 *
 * @apiSuccess {String} mask Requirement discipline mask.
 * @apiSuccess {Number} suggestedSemester Requirement suggested semester.
 * @apiSuccess {Date} createdAt Requirement creation date.
 * @apiSuccess {Date} updatedAt Requirement last update date.
 *
 * @apiSuccess (discipline) {String} code Discipline code.
 * @apiSuccess (discipline) {String} name Discipline name.
 * @apiSuccess (discipline) {String} credits Discipline credits.
 * @apiSuccess (discipline) {String} [department] Discipline department.
 * @apiSuccess (discipline) {String} [description] Discipline description.
 * @apiSuccess (discipline) {Array} [requirements] Discipline requirements.
 * @apiSuccess (discipline) {Date} createdAt Discipline creation date.
 * @apiSuccess (discipline) {Date} updatedAt Discipline last update date.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiSuccessExample
 * HTTP/1.1 200 OK
 * {
 *   "discipline": {
 *     "code": "MC001",
 *     "name": "Fundamentos de computação",
 *     "credits": 6,
 *     "department": "IC",
 *     "description": "Fundamentos de computação",
 *     "createdAt": "2014-07-01T12:22:25.058Z",
 *     "updatedAt": "2014-07-01T12:22:25.058Z"
 *   },
 *   "suggestedSemester": 2,
 *   "createdAt": "2014-07-01T12:22:25.058Z",
 *   "updatedAt": "2014-07-01T12:22:25.058Z"
 * }
 */
router
.route('/catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement')
.get(function getRequirement(request, response) {
  'use strict';

  var requirement;
  requirement = request.requirement;
  return response.status(200).send(requirement);
});

/**
 * @api {put} /catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement Updates requirement information.
 * @apiName updateRequirement
 * @apiVersion 1.0.0
 * @apiGroup requirement
 * @apiPermission changeRequirement
 * @apiDescription
 * When updating a requirement the user must send the requirement suggestedSemester, discipline and mask. If a existing
 * code which is not the original requirement code is sent to this method, a 409 error will be raised. And if no
 * discipline or mask is sent, a 400 error will be raised. If no requirement with the requested code was found, a 404
 * error will be raised.
 *
 * @apiParam {String} discipline Requirement discipline code.
 * @apiParam {String} mask Requirement discipline mask.
 * @apiParam {Number} suggestedSemester Requirement suggested semester.
 *
 * @apiErrorExample
 * HTTP/1.1 404 Not Found
 * {}
 *
 * @apiErrorExample
 * HTTP/1.1 400 Bad Request
 * {
 *   "code": "required"
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
.route('/catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement')
.put(auth.can('changeRequirement'))
.put(function updateRequirement(request, response, next) {
  'use strict';

  var requirement;
  requirement = request.requirement;
  requirement.code = request.discipline ? request.discipline.code : request.param('mask', '');
  requirement.block = request.block._id;
  requirement.suggestedSemester = request.param('suggestedSemester');
  requirement.mask = request.param('mask');
  requirement.discipline = request.discipline ? request.discipline._id : null;
  return requirement.save(function updatedRequirement(error) {
    if (error) {
      error = new VError(error, 'error updating requirement: "%s"', request.params.requirement);
      return next(error);
    }
    return response.status(200).end();
  });
});

/**
 * @api {delete} /catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement Removes requirement.
 * @apiName removeRequirement
 * @apiVersion 1.0.0
 * @apiGroup requirement
 * @apiPermission changeRequirement
 * @apiDescription
 * This method removes a requirement from the system. If no requirement with the requested code was found, a 404 error will be
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
.route('/catalogs/:catalog/modalities/:modality/blocks/:block/requirements/:requirement')
.delete(auth.can('changeRequirement'))
.delete(function removeRequirement(request, response, next) {
  'use strict';

  var requirement;
  requirement = request.requirement;
  return requirement.remove(function removedRequirement(error) {
    if (error) {
      error = new VError(error, 'error removing requirement: "%s"', request.params.requirement);
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

router.param('requirement', function findRequirement(request, response, next, id) {
  'use strict';

  var query;
  query = Requirement.findOne();
  query.where('code').equals(id);
  query.where('block').equals(request.block._id);
  query.populate('discipline');
  query.exec(function foundRequirement(error, requirement) {
    if (error) {
      error = new VError(error, 'error finding requirement: "%s"', requirement);
      return next(error);
    }
    if (!requirement) {
      return response.status(404).end();
    }
    request.requirement = requirement;
    return next();
  });
});

module.exports = router;