var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Action = new Schema({
  parents: [],  // who scored, entered game (player, team)
  value: Schema.Types.Mixed, // what value (1, 2, 1:00.12, etc)
  actiontype: String, // point, exchange
  owner: {  // who created it
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Account'
  }
}, {
  timestamps: true,
  capped: 1024*100
});

module.exports = mongoose.model('Action', Action);
