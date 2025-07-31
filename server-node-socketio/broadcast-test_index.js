const http = require('http');
const { Server } = require('socket.io');

const port = 8081;
const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('chat message', (msg) => {
        socket.broadcast.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(port, () => {
    console.log(`🚀 Node.js Websocket Server (Socket.IO) - Broadcast is running on http://localhost:${port}`);
});