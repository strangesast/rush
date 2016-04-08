var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameStateSchema = require('./gamestateschema');
var extend = require('mongoose-schema-extend');

GameStateFrisbe = GameStateSchema.extend({
  team0score: {
    type: Number,
    required: true,
    default: 0
  },
  team1score: {
    type: Number,
    required: true,
    default: 0
  },
  team0: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Team'
  },
  team1: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Team'
  },
  starttime: Date,
  endtime: Date
});

module.exports = mongoose.model('GameStateFrisbe', GameStateFrisbe);
