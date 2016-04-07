var mongoose = require('mongoose');
var Schema = mongoose.Schema;

Soccer = new Schema({
  name: String,
  date: Date
});

module.exports = mongoose.model('Soccer', Soccer);
