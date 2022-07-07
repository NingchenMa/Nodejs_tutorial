/*
    Request handlers
*/

//Dependencies

//Define all of the handlers

//Define the handlers (object)
var handlers ={};

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

//Export all of the handlers (module)
module.exports = handlers;