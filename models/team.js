var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Team = new Schema({
  name: String,
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Account'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Team', Team);
