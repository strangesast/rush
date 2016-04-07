var mongoose = require('mongoose');
var Schema = mongoose.Schema;

Frisbe = new Schema({
  name: String,
  date: Date
});

module.exports = mongoose.model('Frisbe', Frisbe);
