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

    var nick = null;

    function broadcast(payload) {
        // add the time to make stuff a little more interesting
        payload.time = new Date().toTimeString().split(" ")[0];

        if (nick) {
            payload.nick = nick;
        }

        console.log("Broadcasting:", payload);

        // broadcast does not include the client belonging to clientSocket
        clientSocket.broadcast.json.send(payload);
        clientSocket.json.send(payload);
    }

    broadcast({text: "Someone joined the chat."});

    // listen for messages from the specific client
    clientSocket.on("message", function (payload) {
        console.log("Got:", payload);

        if (payload.nick) {
            nick = payload.nick;
        } else if (payload.text) {
            broadcast(payload);
        }
    });

    clientSocket.on("disconnect", function () {
        broadcast({text: "Leaving..."});
    });
});

