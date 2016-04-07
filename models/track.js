var mongoose = require('mongoose');
var Schema = mongoose.Schema;

Track = new Schema({
  name: String,
  date: Date
});

module.exports = mongoose.model('Track', Track);
