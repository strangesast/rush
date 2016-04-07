var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameSchema = require('./gameschema');
var extend = require('mongoose-schema-extend');

Soccer = GameSchema.extend({});

module.exports = mongoose.model('Soccer', Soccer);
