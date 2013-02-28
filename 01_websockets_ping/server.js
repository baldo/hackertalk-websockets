// first thing we need is a http server. it will be used as the basis for
// the websocket communication

var http = require("http");

var httpServer = http.createServer();
httpServer.listen(3000, function (port) {
    console.log("HTTP server listening on: http://localhost:3000");
});


// now we create our websocket server socket.
var WebSocketServer = require("websocket").server;
var serverSocket = new WebSocketServer({
    httpServer: httpServer,
    autoAcceptConnections: true
});

// listen for incoming connections.
serverSocket.on("connect", function (clientSocket) {
    console.log("New connection.");

    // listen for messages from the specific client
    clientSocket.on("message", function (message) {
        var payload = message.utf8Data;
        console.log("Got:", payload);

        if (payload === "ping") {
            console.log("Sending: pong");
            clientSocket.send("pong");
        }
    });
});

