/*
    This is the primary file for the API
*/

//Dependencies
const http = require('http');
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./config');
var fs = require('fs');

//-------------------------- Delete --------------------------
var _data = require('./lib/data'); // require the data.js file

//TESTING
//@TODO: delete this
_data.create('test','newFile',{'foo':'bar'},function(err){
    console.log('This was the error: ',err);
}); // (dir,file,data,callback)

_data.read('test','newFile',function(err,data){
    console.log('This was the error: ',err);
    console.log('This was the data: ',data);
}); 

_data.update('test','newFile',{'fizz':'buzz'},function(err){
    console.log('This was the error: ',err);
}); // (dir,file,data,callback)

_data.delete('test','newFile',function(err){
    console.log('This was the error: ',err);
}); // (dir,file,data,callback)
//------------------------------------------------------------

//Instantiating the HTTP server
var httpServer = http.createServer(

    //This is a call-back function, will be envoked every time server is being called
    //And each time the (req,res) pair is new for every new incomming request
    function(req, res){
        unifiedServer(req,res);
    }
    /**
     * Note that this function will be called after a specific server port is already being listened,
     * so no need to deal with port issue here
     */
);

//Instantiating the HTTPS server
var httpsServerOptions = {
    'key' :  fs.writeFileSync('./https/key.pem'),
    'cert' : fs.writeFileSync('./https/cert.pem')
};

var httpsServer = https.createServer(httpsServerOptions,function(req, res){
    unifiedServer(req,res);
})

//Start the HTTPS server
httpsServer.listen(config.httpsPort, function() {
    console.log("The server is listening on port " + config.httpsPort," in ",config.envName+" node");
});

//Start the server, and have it listen on port (based on config var)
httpServer.listen(config.httpPort, function() {
    console.log("The server is listening on port " + config.httpPort," in ",config.envName+" node");
});

//All the server logic for both the http and https server
var unifiedServer = function(req, res){

     // Get the url and parse it
     var parsedUrl = url.parse(req.url,true);//true -> call the query string module, two calls at once

     // Get the path from the url
     var path = parsedUrl.pathname; // This is the untrimed path
     var trimmedPath = path.replace(/^\/+|\/+$/g,'');
 
     //Get the query string as an obejct
     var queryStringObject = parsedUrl.query;
 
     //Get the HTTP Method
     var method = req.method.toLowerCase;
 
     //Get the headers as an object
     var headers = req.headers;
 
     //Get the payload if there is any 
     var decoder = new StringDecoder('utf-8');
     var buffer = '';
 
     //This data event might not be called if the payload is empty
     req.on('data', function(data){
         buffer += decoder.write(data);
     });
 
     //The end event will always be called
     req.on('end', function(){
 
         buffer += decoder.end();
 
         //This step determines which handler to choose based on routing parameter
         //Choose the handler this request should go to. If not found use the notFound handler (this is a function)
         var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notfound;
 
         //Construct the data object to send to the handler 
         var data = {
             'trimmedPath' : trimmedPath,
             'queryStringObject' : queryStringObject,
             'method' : method,
             'handlers' : handlers,
             'payload' : buffer
         };
 
         // Route the request to the handler specified in the router
         chosenHandler(data,function(statusCode,payload){
 
             //Use the status code called back by the handler, or default to 200
             statusCode = typeof(statusCode) == 'number' ? statusCode : 200 ;
 
             //Use the payload called back by the handler, or default to an empty object
             payload = typeof(payload) == 'object'? payload : {};
 
             //Convert the payload (json format) to a string
             var payloadStr = JSON.stringify(payload); //This is not the paylaod we received, this is the payload the handler sends back to teh user
 
             //Return the response
             res.setHeader('Content-Type', 'application/json'); // (key,value) The content will be parsed as a json string
             res.writeHead(statusCode);
             res.end(payloadStr);
 
             // Send the response
             console.log( 'Returning this response: ' + statusCode, payloadStr );
 
         });
         
     });

}

//Define the handlers (object)
var handlers ={};

//Sample handler
// handlers.sample = function(data,callback){
//     //Callback a http status code, and a payload object
//     callback(406,{ 'name' : 'sample handler' });
// };

// Ping handler
handlers.ping = function(data,callback){
    callback(200); // Send back the status code as a respond
}

//Not-found handler
handlers.notfound = function(data,callback){
    callback(404);
};

//Define a request router (This is an object)
var router = {
    'ping' : handlers.ping
};
