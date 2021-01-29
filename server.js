

/*
 * Config
 */
const express = require('express');   //Dependencies
const app = express();
const port = process.env.PORT || 3000;
app.use(express.static(`${__dirname}/public`));



/*
 * socket.io
 */

const http = require("http");         //Dependencies
const server = http.createServer(app);
server.listen(port);


// Setup sockets with the HTTP server
const socketio = require('socket.io');
const { match } = require('assert');
let io = socketio.listen(server);
console.log(`Listening for socket connections on port ${port}`);


//-------------------------------------
// Manage behaviour of all the devices in parallel, allowing for multi-clicks
// Check if someone is clicking on a button and send buzz instructions to everyone
// let buttonCount = 0;

// setInterval( function() {
//   sendBuzz();
// }, 300);                            // sampling every 300 ms

// function sendBuzz() {
//   if(buttonCount > 0) {
//     io.sockets.emit('buzz', '1');   //if at least one person clicked, everyone is buzzing
//     //console.log('sent buzz: 1');
//   } else { 
//     io.sockets.emit('buzz', '0');
//     //console.log('sent Buzz: 0');
//   }
// buttonCount = 0;                    // reset count at the end of the interval
// }


//------ Combine data
let ChloeData = "ccccS";  // receiving 0000XXXXS
let KristiaData = "kkkk";  // // receiving XXXX0000S
let instructions;

function chloeUpdateData(data) {
  ChloeData = data.slice(4, 9);
  instructions = KristiaData+ChloeData;
  io.sockets.emit('jacketInstructions', instructions);
}

function KristiaUpdateData(data) {
  KristiaData = data.slice(0, 4);
  instructions = KristiaData+ChloeData;
  io.sockets.emit('jacketInstructions', instructions);
}


//------ Test jacket can receive from server
// Pretend it's sending from Kristia
// let instructionNum = 0;

// setInterval( function() {
//   sendInstruction();
// }, 1000);                            // sampling every 300 ms

// function sendInstruction() {
  
//   if (instructionNum == 0) {
//     KristiaUpdateData('00000000S');
//     instructionNum = 1;
//   } else { 
//     KristiaUpdateData('00010000S');
//     instructionNum = 0;
//   }
// }



//-------------------------------------
// Register a callback function to run when we have an individual connection
// This is run for each individual client that connects
io.sockets.on('connection',
  // Callback function to call whenever a socket connection is made
  function (socket) {

    // Print message to the console indicating that a new client has connected
    console.log("New client: " + socket.id);


    //----------> Manage messages from jacket
    socket.on('jacketSendingChloe',
    function(data) {
      console.log("Chloe is sending: " + data);
      chloeUpdateData(data);
      }
    );

    socket.on('jacketSendingKristia',
        function(data) {
          console.log("Kristia is sending: " + data);
          KristiaUpdateData(data);
          }
        );


    //----------
      
    
    // Specify a callback function to run when the client disconnects
    socket.on('disconnect',
      function() {
        console.log("Client has disconnected: " + socket.id);
        // remove socket 
      }
    );
  }
);

