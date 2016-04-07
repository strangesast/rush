var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameSchema = require('./gameschema');
var extend = require('mongoose-schema-extend');

module.exports = mongoose.model('Game', GameSchema);
