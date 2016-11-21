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


import jsonpatch from 'fast-json-patch';
import Bar from './bar.model';
import _ from 'lodash';

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
      jsonpatch.apply(entity, patches, /*validate*/ true);
    } catch (err) {
      return Promise.reject(err);
    }

    return entity.save();
  };
}

function removeEntity(res) {
  return function (entity) {
    if (entity) {
      return entity.remove()
        .then(() => {
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
export function index(req, res) {
  return Bar.find().exec()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Bar from the DB
export function show(req, res) {
  return Bar.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Bar in the DB
export function create(req, res) {
  return Bar.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Upserts the given Bar in the DB at the specified ID
export function upsert(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Bar.findOneAndUpdate({_id: req.params.id}, req.body, {
    upsert: true,
    setDefaultsOnInsert: true,
    runValidators: true
  }).exec()

    .then(respondWithResult(res))
    .catch(handleError(res));
}


export function upsertVisitor(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  Bar.findOne({yelpId: req.params.id}).exec().then(
    function (bar) {
      if (!bar) {//make a new one
        return Bar.create({
          yelpId: req.params.id,
          visitors: [req.params.user_id],
          visitorsCount: 1
        }).then(respondWithResult(res, 201)).catch(handleError(res));
      } else {//update existing one

        const idx = _.indexOf(bar.visitors, req.params.user_id);
        if (idx >= 0) {
          bar.visitors.splice(idx, 1);
        } else {
          bar.visitors.push(req.params.user_id);
        }
        bar.visitorsCount = bar.visitors.length;
        console.info(bar);
        return Bar.findOneAndUpdate({_id: bar._id}, bar, {
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }).exec()
          .then(respondWithResult(res))
          .catch(handleError(res));
      }
    }).catch(handleError(res));

}

// Updates an existing Bar in the DB
export function patch(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Bar.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(patchUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Bar from the DB
export function destroy(req, res) {
  return Bar.findById(req.params.id).exec()
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}


import Yelp from 'yelp';

const yelp = new Yelp({
  consumer_key: 'Hmi1piXR8FWgUpewtGDJAA',
  consumer_secret: '1Ud-UFlihGw5c-anDShdR82qtao',
  token: 'AtCt_0hOZrv7HmhbVefKSN2fV2DyETH7',
  token_secret: 'dvy-aJg-M-EscbX7gOgT5ENsgCI',
});


export function search(req, res) {
  yelp.search({term: 'bar', location: req.params.term}).then(function (data) {

    let yelpIds = [];

    data.businesses && data.businesses.forEach(function (d) {
      yelpIds.push(d.id);
    });

    Bar.find({
      'yelpId': {$in: yelpIds}
    }, function (err, docs) {
      if (err) {
        return res.json(data);
      } else {
        let mapData = {};
        docs.map(function (d) {
          return mapData[d.yelpId] = d;
        });

        data.businesses.forEach(function (d) {
          d.visitors = mapData[d.id] ? mapData[d.id].visitors : [];
          d.visitorsCount = mapData[d.id] ? mapData[d.id].visitorsCount : 0;
          if (req.user && req.user._id) {
            d.imgoing = (_.indexOf(d.visitors, req.user._id) >= 0);
          }
        });

        return res.json(data);
      }
    });
  }).catch(handleError(res));
}
