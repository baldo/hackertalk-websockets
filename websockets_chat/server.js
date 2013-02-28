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

    var nick = null;

    function broadcast(payload) {
        // add the time to make stuff a little more interesting
        payload.time = new Date().toTimeString().split(" ")[0];

        if (nick) {
            payload.nick = nick;
        }

        console.log("Broadcasting:", payload);
        serverSocket.broadcast(JSON.stringify(payload));
    }

    broadcast({text: "Someone joined the chat."});

    // listen for messages from the specific client
    clientSocket.on("message", function (message) {
        var payload = JSON.parse(message.utf8Data);
        console.log("Got:", payload);

        if (payload.nick) {
            nick = payload.nick;
        } else if (payload.text) {
            broadcast(payload);
        }
    });

    clientSocket.on("close", function () {
        broadcast({text: "Leaving..."});
    });
});

