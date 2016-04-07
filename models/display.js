var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Display = new Schema({
  name: String,
  location: String,
  port: Number,
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Game'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Display', Display);
