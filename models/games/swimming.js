var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameSchema = require('./gameschema');
var extend = require('mongoose-schema-extend');

Swimming = GameSchema.extend({});

module.exports = mongoose.model('Swimming', Swimming);
