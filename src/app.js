const {WebhookClient} = require('dialogflow-fulfillment');
const express = require('express');
const bodyParser = require('body-parser');

const Message = require('./db/message').Message;


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



function welcome (agent) {
    agent.add(`Welcome to Express.JS webhook!`);
}

function fallback (agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}


let last = {};


function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
// intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
    //agent.handleRequest(intentMap);

    var responses = agent.alternativeQueryResults;
    console.log(`  Query: ${responses}`);

  //  const result = responses[1].QueryResult;
  //  console.log(`  Query: ${result.queryText}`);

 //   String responses = agent.locale;
    
    console.log(`  Locale: ${agent.locale}`);
    console.log(`  Query: ${agent.query}`);
    console.log(`  Agent Version : ${agent.agentVersion }`);

    //var a = {a:"2da",b:"xfgsfg"};


    var query = agent.query;
    console.log(`  Query: ${query}`);
    var responses = agent.consoleMessages;
    console.log(`  Responses: ${JSON.stringify(responses)}`);
    var intentName = agent.intent;
    console.log(`  Intent: ${intentName}`);


    var s = '{"a":"2da","b":"xfgsfg"}';

    var message = new Message({
      input: s,
      response: responses,
      date: new Date().toISOString()
    });
    message.save();

    last = {
        input: s,
        response: responses,
        date: new Date().toISOString()
      };


agent.handleRequest(intentMap);

}

function WebhookGetting(req, res) {
  //  const agent = new WebhookClient({request: req, response: res});
    console.info(`agent get`);

}


// Webhook
app.get('/', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
   // WebhookGetting(req, res);
    res.send("hello");
});

// Webhook
app.post('/Webhook', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});



app.get('/messages/last/', function(req, res) {
  res.json(last);
});
app.get('/messages/', function(req, res) {
  Message.find({}, function(err, data){
    if(err) {
      res.status(500).send(err);
    }
    res.json(data);
  });
});


app.listen(8080, function () {
    console.info(`Webhook listening on port 8080!`)
});
