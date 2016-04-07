var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameStateSchema = require('./gamestateschema');
var extend = require('mongoose-schema-extend');

GameStateSoccer = GameStateSchema.extend({});

module.exports = mongoose.model('GameStateSoccer', GameStateSoccer);
