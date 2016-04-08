var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var GameState = require('./gamestates/gamestate');

var Action = new Schema({
  parent: {  // who scored, entered game (player, team)
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'GameState'
  },
  tag: String,
  value: Schema.Types.Mixed, // what value (1, 2, 1:00.12, etc)
  oldvalue: Schema.Types.Mixed,
  type: String, // point, exchange
  owner: {  // who created it
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Account'
  }
}, {
  timestamps: true,
  capped: 1024*100
});

Action.pre('save', function(next) {
  var _this = this;
  return GameState.findById(this.parent).then(function(parent_doc) {
    if(parent_doc[_this.tag] === _this.oldvalue) {
      parent_doc[_this.tag] = _this.value;
    } else {
      // value wasn't the same as when it was asked to be changed
      var err = new Error('value changed');
      err.status = 400;
      return next(err);
    }
    return parent_doc.save().then(function() {
      return next();
    });
  }).catch(next);
});

module.exports = mongoose.model('Action', Action);
