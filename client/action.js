var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Action = new Schema({
  parent: Schema.Types.Mixed,
  tag: String,
  value: Schema.Types.Mixed, // what value (1, 2, 1:00.12, etc)
  oldvalue: Schema.Types.Mixed,
  type: String, // point, exchange
  owner: Schema.Types.Mixed
}, {
  timestamps: true,
  capped: 1024*100
});

module.exports = mongoose.model('Action', Action);
