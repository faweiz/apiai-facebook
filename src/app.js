'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const {WebhookClient} = require('dialogflow-fulfillment');
const Message = require('../db/message').Message;

let last = {};
let accessToken = 'abc123'; // add header: access_Token and abc123

const app = express();
// Process application/json
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// Index route
app.get('/', function (req, res) {
     res.send('Hello world, I am a Facebook chat bot');
});

// Post messages from dialogflow to Webhook
app.post('/webhook', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});

//RESTful API: GET/POST from Mongoose database
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

// authenticated function to access
function authenticated (req, res, next) {
  if (req.get('access_token') && req.get('access_token') === accessToken) {
    next();
  } else {
    next('unauthorized');
  }
};

function welcome (agent) {
    agent.add(`Welcome to Express.JS webhook!`);
}

function fallback (agent) {
    agent.add(`I didn't understand`);
    agent.add(`I'm sorry, can you try again?`);
}

function WebhookProcessing(req, res) {
    const agent = new WebhookClient({request: req, response: res});
    console.info(`agent set`);

    let intentMap = new Map();
    intentMap.set('Default Welcome Intent', welcome);
    intentMap.set('Default Fallback Intent', fallback);
// intentMap.set('<INTENT_NAME_HERE>', yourFunctionHandler);
    //agent.handleRequest(intentMap);

    var query = agent.query;
    console.log(`  Query: ${query}`);
    var responses = agent.consoleMessages;
    var responses_string = JSON.stringify(responses);
    console.log(`  Responses: ${responses_string}`);
    var intentName = agent.intent;
    console.log(`  Intent: ${intentName}`);

    var message = new Message({
	input: query,
	response: responses_string,
	date: new Date().toISOString()
    });
    message.save();
    last = {
	input: query,
        response: responses,
	date: new Date().toISOString()
    };
    agent.handleRequest(intentMap);	
}

app.listen((process.env.PORT || 8000), function () {
    console.log('Rest service ready on port ' + process.env.PORT);
});
