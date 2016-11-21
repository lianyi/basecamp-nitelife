'use strict';

// Use local.env.js for environment variables that will be set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
  DOMAIN: 'http://127.0.0.1:9000',
  SESSION_SECRET: 'pollapp-secret',

  TWITTER_ID: 'y1wpQmkGXYS9k1LrlYt2uWEgE',
  TWITTER_SECRET: 'dhFhRB9ZotcTjsJl7Z9UKxMr5YHRI9mSHyJBRWiRNfixX8yPra',

  MONGODB_URI: 'mongodb://heroku_65fdsb7g:fekre9vsc236fkrr7hkks7cj@ds159237.mlab.com:59237/heroku_65fdsb7g',

  YELP_CONSUMER_KEY: 'IvbDA15EEN_R7Js3yt4SVw',
  YELP_CONSUMER_SECRET: '0Jzq3SRyYAlFXm9MBKk3-Phxxqs',
  YELP_TOKEN: 'H6xF1lOA_H0PC52eudBCjMlAiut7hQc9',
  YELP_TOKEN_SECRET: 'LuVnXXSA30z37V_n_Ynn8XCyk4U',

  // Control debug level for modules using visionmedia/debug
  DEBUG: ''
};
//# sourceMappingURL=local.env.js.map
