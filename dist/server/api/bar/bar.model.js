'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mongoose = require('mongoose');

var _mongoose2 = _interopRequireDefault(_mongoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BarSchema = new _mongoose2.default.Schema({
  yelpId: String,
  visitors: { type: Array, default: [] },
  visitorsCount: { type: Number, default: 0 }
});

exports.default = _mongoose2.default.model('Bar', BarSchema);
//# sourceMappingURL=bar.model.js.map
