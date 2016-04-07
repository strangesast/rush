var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var GameSchema = new Schema({
  name: String,
  date: Date,
  participants: [],
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
