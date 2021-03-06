// first thing we need is a http server. it will serve the socket.io.js
// for the client and also be used for the communication e. g. via
// websockets / long polling / ...

var http = require("http");

var httpServer = http.createServer();
httpServer.listen(3000, function (port) {
    console.log("HTTP server listening on: http://localhost:3000");
});


// now we create our socket.io server socket.
var io = require("socket.io");
var serverSocket = io.listen(httpServer);


// listen for incoming connections.
serverSocket.on("connection", function (clientSocket) {
    console.log("New connection.");

    // listen for messages from the specific client
    clientSocket.on("message", function (payload) {
        console.log("Got:", payload);

        if (payload === "ping") {
            console.log("Sending: pong");
            clientSocket.send("pong");
        }
    });
});

