var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Player = require('./player');

var Team = new Schema({
  name: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Account'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', Team);
