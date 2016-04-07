var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameSchema = require('./gameschema');
var extend = require('mongoose-schema-extend');


Frisbe = GameSchema.extend({});

module.exports = mongoose.model('Frisbe', Frisbe);
