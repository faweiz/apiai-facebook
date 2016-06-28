const Message = require('./message');
const message = new Message({input:'hi', response: 'hey'});
message.save(function(err, data){
  console.log(data);
})
Message.find({}, function(err,data){
  //console.log(data);
});
