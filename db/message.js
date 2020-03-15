const mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOLAB_URI);
mongoose.connect('mongodb://tonyz:123456789@ds051655.mlab.com:51655/apiai-faweizfacebook', {useMongoClient: true, useNewUrlParser: true});
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
