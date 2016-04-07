var mongoose = require('mongoose');
var Schema = mongoose.Schema;

Swimming = new Schema({
  name: String,
  date: Date
});

module.exports = mongoose.model('Swimming', Swimming);
