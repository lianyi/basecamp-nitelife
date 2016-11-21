'use strict';

var express = require('express');
var controller = require('./bar.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.get('/search/:term', controller.search);

// Only admins may DELETE and PUT requests
router.delete('/:id', auth.hasRole('admin'), controller.destroy);

//the rest need auth
router.all('*', auth.isAuthenticated());
router.put('/:id/:user_id', controller.upsertVisitor);
// router.post('/', controller.create);
// router.put('/:id', controller.upsert);
// router.patch('/:id', controller.patch);
// router.delete('/:id', controller.destroy);


module.exports = router;
