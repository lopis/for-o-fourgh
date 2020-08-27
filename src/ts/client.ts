let socket: SocketIO.Server

/**
 * Bind Socket.IO and button events
 */
function bind() {
    socket.on("start", () => {
        console.log("Start");
    });

    socket.on("connect", () => {
        console.log("Waiting for opponent...");
    });

    socket.on("disconnect", () => {
        console.log("Connection lost!");
    });
}

/**
 * Client module init
 */
function initClient () {
    socket = window.io()
    bind();
}