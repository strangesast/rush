var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameSchema = require('./gameschema');
var extend = require('mongoose-schema-extend');
var GameStateFrisbe = require('../gamestates/gamestatefrisbe');

Frisbe = GameSchema.extend({});

//Frisbe.pre('save', function(next) {
//  if(!this.state) {
//    if(this.teams.length < 1 || this.teams.length > 2) {
//      return next(new Error('invalid teams length'));
//    }
//    this.state = new GameStateFrisbe({
//      team0: this.teams[0],
//      team1: this.teams[1]
//    });
//  }
//  return next();
//});

module.exports = mongoose.model('Frisbe', Frisbe);
