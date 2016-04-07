var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameStateSchema = require('./gamestateschema');
var extend = require('mongoose-schema-extend');

GameStateSwimming = GameStateSchema.extend({});

module.exports = mongoose.model('GameStateSwimming', GameStateSwimming);
