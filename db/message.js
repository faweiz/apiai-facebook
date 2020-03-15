const mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI, {useMongoClient: true, useNewUrlParser: true});
const db = mongoose.connection;
const Schema = mongoose.Schema;
const messageSchema = new Schema({
  input: {
    type: String,
    required: true
  },
  response: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now()
  }
});

module.exports.Message = db.model('Message', messageSchema);
