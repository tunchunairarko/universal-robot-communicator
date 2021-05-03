// #!/usr/bin/env node
// import { createRequire } from 'module'
// const require = createRequire(import.meta.url);
// var WebSocketServer = require('websocket').server;
// require("dotenv").config();
// var http = require('http');
// var now = new Date;
// import { io } from "socket.io-client";
// const internal_socketio = io("ws://localhost:7000");


// const to_f = () =>{
//     var x = new Date()
//     var UTCseconds = (x.getTime() + x.getTimezoneOffset()*60*1000)/1000;
//     return UTCseconds;
// }

// var server = http.createServer(function(request, response) {
//     console.log((new Date()) + ' Received request for ' + request.url);
//     response.writeHead(404);
//     response.end();
// });
// server.listen(process.env.PORT, function() {
//     console.log((new Date()) + ' Server is listening on port '+process.env.PORT);
//     console.log(to_f())
//     // console.log('timestamp '+utc_timestamp)
// });

// var wsServer = new WebSocketServer({
//     httpServer: server,
//     // You should not use autoAcceptConnections for production
//     // applications, as it defeats all standard cross-origin protection
//     // facilities built into the protocol and the browser.  You should
//     // *always* verify the connection's origin and decide whether or not
//     // to accept it.
//     autoAcceptConnections: false
// });

// function originIsAllowed(origin) {
//   // put logic here to detect whether the specified origin is allowed.
//   return true;
// }

// function getLatency(val){
//     return parseFloat(to_f())-parseFloat(val)+0.001
// }

// wsServer.on('request', function(request) {
//     if (!originIsAllowed(request.origin)) {
//       // Make sure we only accept requests from an allowed origin
//       request.reject();
//       console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
//       return;
//     }
    
//     var connection = request.accept(null, request.origin);
    
//     console.log((new Date()) + ' Connection accepted.');

//     connection.on('open',function(message){
//         connection.ping("COnnected")
//     })


//     connection.on('message', function(message) {
//         if (message.type === 'utf8') {
//             const data=JSON.parse(message.utf8Data)
//             // socket.emit("remoterobotdata", data)
//             console.log(to_f())
            
//             console.log('Received Message: ' + message.utf8Data);

//             console.log('Latency: '+getLatency(data['robotdata']['timestamp']))
//             connection.sendUTF(message.utf8Data);
//         }
//         else if (message.type === 'binary') {
//             console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
//             connection.sendBytes(message.binaryData);
//         }
//     });
//     connection.on('close', function(reasonCode, description) {
//         console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
//     });

//     internal_socketio.on("FROMNODEAPI",function(data){
//         wsServer.send(data)
        
//     })
// });

// server.on("exit",function(){
//     wsServer.shutDown()
// })


//#!/usr/bin/env node
import { createRequire } from 'module'
const require = createRequire(import.meta.url);

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const socketio = require("socket.io")

const PORT = process.env.PORT || 7000;

const app = express();
app.use(express.json());
app.use(cors());
// app.use(express.static("client/build"))

// const root = require('path').join(__dirname, 'client', 'build')
// app.use(express.static(root));


app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === 'OPTIONS') {
      res.header("Access-Control-Allow-Methods", "PUT, POST, DELETE, GET");
      return res.status(200).json({});
  }
  next();
});



const server = app.listen(PORT, () => console.log(`The server has started on port: ${PORT}`));

/////////////////////
//////////////////////
///////////////////



const io = socketio(server,{pingTimeout: 0, origins: '*:*'})

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("pythondata",function(frame){
    console.log(frame)
    // var buff = Buffer.from(frame).toString()
    // let base64data = buff.toString('base64');
  
    socket.emit("FROMPYAPI","received_data")

  })
  

  socket.on("frontenddata",function(data){
    console.log(data)

    socket.broadcast.emit("FROMNODEAPI",data)
  })

});


const getApiAndEmit = socket => {
  const response = new Date();
  // Emitting a new message. Will be consumed by the client
  socket.emit("FromAPI", response);
}