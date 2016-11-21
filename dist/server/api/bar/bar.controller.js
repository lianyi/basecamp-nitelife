/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/bars              ->  index
 * POST    /api/bars              ->  create
 * GET     /api/bars/:id          ->  show
 * PUT     /api/bars/:id          ->  upsert
 * PATCH   /api/bars/:id          ->  patch
 * DELETE  /api/bars/:id          ->  destroy
 */

'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

exports.index = index;
exports.show = show;
exports.create = create;
exports.upsert = upsert;
exports.upsertVisitor = upsertVisitor;
exports.patch = patch;
exports.destroy = destroy;
exports.search = search;

var _fastJsonPatch = require('fast-json-patch');

var _fastJsonPatch2 = _interopRequireDefault(_fastJsonPatch);

var _bar = require('./bar.model');

var _bar2 = _interopRequireDefault(_bar);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _yelp = require('yelp');

var _yelp2 = _interopRequireDefault(_yelp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function (entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function patchUpdates(patches) {
  return function (entity) {
    try {
      _fastJsonPatch2.default.apply(entity, patches, /*validate*/true);
    } catch (err) {
      return _promise2.default.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove().then(function () {
        res.status(204).end();
      });
    }
  };
}

function handleEntityNotFound(res) {
  return function (entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function (err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Bars
function index(req, res) {
  return _bar2.default.find().exec().then(respondWithResult(res)).catch(handleError(res));
}

// Gets a single Bar from the DB
function show(req, res) {
  return _bar2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(respondWithResult(res)).catch(handleError(res));
}

// Creates a new Bar in the DB
function create(req, res) {
  return _bar2.default.create(req.body).then(respondWithResult(res, 201)).catch(handleError(res));
}

// Upserts the given Bar in the DB at the specified ID
function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _bar2.default.findOneAndUpdate({ _id: req.params.id }, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec().then(respondWithResult(res)).catch(handleError(res));
}

function upsertVisitor(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  _bar2.default.findOne({ yelpId: req.params.id }).exec().then(function (bar) {
    if (!bar) {
      //make a new one
      return _bar2.default.create({
        yelpId: req.params.id,
        visitors: [req.params.user_id],
        visitorsCount: 1
      }).then(respondWithResult(res, 201)).catch(handleError(res));
    } else {
      //update existing one

      var idx = _lodash2.default.indexOf(bar.visitors, req.params.user_id);
      if (idx >= 0) {
        bar.visitors.splice(idx, 1);
      } else {
        bar.visitors.push(req.params.user_id);
      }
      bar.visitorsCount = bar.visitors.length;
      console.info(bar);
      return _bar2.default.findOneAndUpdate({ _id: bar._id }, bar, {
        upsert: true,
        setDefaultsOnInsert: true,
        runValidators: true
      }).exec().then(respondWithResult(res)).catch(handleError(res));
    }
  }).catch(handleError(res));
}

// Updates an existing Bar in the DB
function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return _bar2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(patchUpdates(req.body)).then(respondWithResult(res)).catch(handleError(res));
}

// Deletes a Bar from the DB
function destroy(req, res) {
  return _bar2.default.findById(req.params.id).exec().then(handleEntityNotFound(res)).then(removeEntity(res)).catch(handleError(res));
}

var yelp = new _yelp2.default({
  consumer_key: 'Hmi1piXR8FWgUpewtGDJAA',
  consumer_secret: '1Ud-UFlihGw5c-anDShdR82qtao',
  token: 'AtCt_0hOZrv7HmhbVefKSN2fV2DyETH7',
  token_secret: 'dvy-aJg-M-EscbX7gOgT5ENsgCI'
});

function search(req, res) {
  yelp.search({ term: 'bar', location: req.params.term }).then(function (data) {

    var yelpIds = [];

    data.businesses && data.businesses.forEach(function (d) {
      yelpIds.push(d.id);
    });

    _bar2.default.find({
      'yelpId': { $in: yelpIds }
    }, function (err, docs) {
      if (err) {
        return res.json(data);
      } else {
        var _ret = function () {
          var mapData = {};
          docs.map(function (d) {
            return mapData[d.yelpId] = d;
          });

          data.businesses.forEach(function (d) {
            d.visitors = mapData[d.id] ? mapData[d.id].visitors : [];
            d.visitorsCount = mapData[d.id] ? mapData[d.id].visitorsCount : 0;
            if (req.user && req.user._id) {
              d.imgoing = _lodash2.default.indexOf(d.visitors, req.user._id) >= 0;
            }
          });

          return {
            v: res.json(data)
          };
        }();

        if ((typeof _ret === 'undefined' ? 'undefined' : (0, _typeof3.default)(_ret)) === "object") return _ret.v;
      }
    });
  }).catch(handleError(res));
}
//# sourceMappingURL=bar.controller.js.map
