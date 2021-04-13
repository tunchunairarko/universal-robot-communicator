#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');
var now = new Date;
import { io } from "socket.io-client";
const internal_socketio = io("ws://localhost:5000");


const to_f = () =>{
    x = new Date()
    var UTCseconds = (x.getTime() + x.getTimezoneOffset()*60*1000)/1000;
    return UTCseconds;
}

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(5452, function() {
    console.log((new Date()) + ' Server is listening on port 5452');
    console.log(to_f())
    // console.log('timestamp '+utc_timestamp)
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

function getLatency(val){
    return parseFloat(to_f())-parseFloat(val)+0.001
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept(null, request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            const data=JSON.parse(message.utf8Data)
            socket.emit("remoterobotdata", data)
            console.log(to_f())
            
            console.log('Received Message: ' + message.utf8Data);

            console.log('Latency: '+getLatency(data['robotdata']['timestamp']))
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });

    internal_socketio.on("FROMNODEAPI",function(data){
        wsServer.send(data)
        
    })
});

server.on("exit",function(){
    wsServer.shutDown()
})