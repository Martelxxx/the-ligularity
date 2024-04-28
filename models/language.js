const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const languageSchema = new Schema({
  name: String,
  agent: String,
  purpose: String,
  context: String,
  consonant: String,
  vowel: String,
  grammar: String
});

const Language = mongoose.model('Language', languageSchema);

module.exports = Language;