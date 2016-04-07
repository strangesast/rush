var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Player = new Schema({
  name: String,
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Player', Player);
