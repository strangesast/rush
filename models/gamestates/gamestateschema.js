var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameStateSchema = new Schema({
  players: [{type: Schema.Types.ObjectId, ref: 'Player'}],
  teams: [{type: Schema.Types.ObjectId, ref: 'Team'}],
  actions: [{type: Schema.Types.ObjectId, ref: 'Action'}],
}, {
  collection : 'gamestates',
  discriminatorKey : '_type'
});

module.exports = GameStateSchema;
