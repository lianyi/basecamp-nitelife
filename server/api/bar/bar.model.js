'use strict';

import mongoose from 'mongoose';

var BarSchema = new mongoose.Schema({
  yelpId: String,
  visitors: {type: Array, default: []},
  visotorsCount: {type: Number, default: 0},
});

export default mongoose.model('Bar', BarSchema);
