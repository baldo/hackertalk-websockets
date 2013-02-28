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

// configure transports for socket.io
serverSocket.set("transports", [
    "websocket"
    // "xhr-polling"
]);


// listen for incoming connections in namespace "chat".
serverSocket.of("/chat").on("connection", function (clientSocket) {
    console.log("New chat connection.");

    function broadcast(payload) {
        // add the time to make stuff a little more interesting
        payload.time = new Date().toTimeString().split(" ")[0];

        // get nick stored for the socket
        var nick = clientSocket.get("nick", function (err, nick) {
            if (nick) {
                payload.nick = nick;
            }

            console.log("Broadcasting:", payload);

            // broadcast does not include the client belonging to clientSocket
            clientSocket.broadcast.emit("chat-message", payload);
            clientSocket.emit("chat-message", payload);
        });
    }

    broadcast({text: "Someone joined the chat."});

    // listen for "set-nick" events from the specific client
    clientSocket.on("set-nick", function (payload, callback) {
        clientSocket.set("nick", payload.nick, function () {
            if (callback) {
                // acknowledge handling of the message
                callback("Nick has been set!");
            }
        });
    });

    // listen for "chat-message" events from the specific client
    clientSocket.on("chat-message", function (payload) {
        console.log("Got:", payload);
        broadcast(payload);
    });

    clientSocket.on("disconnect", function () {
        broadcast({text: "Leaving..."});
    });
});


// listen for incoming connections in namespace "ping".
serverSocket.of("/ping").on("connection", function (clientSocket) {
    console.log("New ping connection.");

    // listen for messages from the specific client
    clientSocket.on("message", function (payload) {
        console.log("Got:", payload);

        if (payload === "ping") {
            console.log("Sending: pong");
            clientSocket.send("pong");
        }
    });
});

