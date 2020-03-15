'use strict';

const express = require('express');
const bodyParser = require('body-parser');
//const uuid = require('node-uuid');
//const JSONbig = require('json-bigint');

const {WebhookClient} = require('dialogflow-fulfillment');


const sessionIds = new Map();
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

/* // Post messages from api.ai to Facebook messenger
app.post('/webhook/', function (req, res) {
    try {
        var data = JSONbig.parse(req.body);

        var messaging_events = data.entry[0].messaging;
        for (var i = 0; i < messaging_events.length; i++) {
            var event = data.entry[0].messaging[i];
            processEvent(event);
        }
        return res.status(200).json({
            status: "ok"
        });
    } catch (err) {
        return res.status(400).json({
            status: "error",
            error: err
        });
    }

}); */

//RESTful API: GET/POST
// app.get('/messages/last/', authenticated, function(req, res) {
  // res.json(last);
// });
// app.get('/messages/', authenticated, function(req, res) {
  // Message.find({}, function(err, data){
    // if(err) {
      // res.status(500).send(err);
    // }
    // res.json(data);
  // });
// });


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







function authenticated (req, res, next) {
  if (req.get('access_token') && req.get('access_token') === accessToken) {
    next();
  } else {
    next('unauthorized');
  }
};






/* function processEvent(event) {
    var sender = event.sender.id.toString();

    if (event.message && event.message.text) {
        var text = event.message.text;
        // Handle a text message from this sender

        if (!sessionIds.has(sender)) {
            sessionIds.set(sender, uuid.v1());
        }

        console.log("Text: ", text);






        let apiaiRequest = apiAiService.textRequest(text,
            {
                sessionId: sessionIds.get(sender)
            });
        apiaiRequest.on('response', (response) => {
            if (isDefined(response.result)) {
                let responseText = response.result.fulfillment.speech;
                let responseData = response.result.fulfillment.data;
            // add "status" "location" "appliance" for home appliance control
                var responseStatus = response.result.parameters.state;
                var responseLocation = response.result.parameters.locate; 
                var responseAppliance = response.result.parameters.appliance;
                let action = response.result.action;

                if (isDefined(responseData) && isDefined(responseData.facebook)) {
                    try {
                        console.log('Response as formatted message');
                        sendFBMessage(sender, responseData.facebook);
                    } catch (err) {
                        sendFBMessage(sender, {text: err.message });
                    }
                } else if (isDefined(responseText)) {
                    console.log('Response as text message');
                    // facebook API limit for text length is 320,
                    // so we split message if needed
                    var splittedText = splitResponse(responseText);

                    async.eachSeries(splittedText, (textPart, callback) => {
                        sendFBMessage(sender, {text: textPart}, callback);
                    });
                    
//                console.log("responseStatus: ", responseStatus);
//                console.log("responseAppliance: ", responseAppliance);
//                console.log("responseLocation: ", responseLocation);
                    var message = new Message({
                      input: text,
                      response: responseText,
                      date: new Date().toISOString()
                    });
                    message.save();
                    last = {
                      status:responseStatus,
                      appliance:responseAppliance,
                      location:responseLocation,
                      input: text,
                      response: responseText,
                      date: new Date().toISOString()
                    };
                }

            }
        });
		
        apiaiRequest.on('error', (error) => console.error(error));
        apiaiRequest.end();
		
    }
} */
















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
	
	var s = '{"a":"2da","b":"xfgsfg"}';


	var message = new Message({
	  input: query,
	  response: responses,
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

// Webhook
app.post('/webhook', function (req, res) {
    console.info(`\n\n>>>>>>> S E R V E R   H I T <<<<<<<`);
    WebhookProcessing(req, res);
});















app.listen((process.env.PORT || 8000), function () {
    console.log('Rest service ready on port ' + process.env.PORT);
});
