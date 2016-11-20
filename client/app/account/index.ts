'use strict';
const angular = require('angular');

const uiRouter = require('angular-ui-router');

import routing from './account.routes';
import login from './login';
import oauthButtons from '../../components/oauth-buttons';

export default angular.module('nitelifeApp.account', [

  uiRouter,
  login,
  oauthButtons
])
  .config(routing)

  .run(function ($rootScope) {
    'ngInject';
    $rootScope.$on('$stateChangeStart', function (event, next, nextParams, current) {
      if (next.name === 'logout' && current && current.name && !current.authenticate) {
        next.referrer = current.name;
      }
    });
  })
  .name;
