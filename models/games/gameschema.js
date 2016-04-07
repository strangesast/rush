var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  name: String,
  date: Date,
  participants: [],
  teams: [{type: Schema.Types.ObjectId, ref: 'Team'}],
  state: {
    type: Schema.Types.ObjectId,
    ref: 'GameState'
  },
  owner: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Account'
  }
}, {
  collection : 'games',
  discriminatorKey : '_type'
});

module.exports = GameSchema;
