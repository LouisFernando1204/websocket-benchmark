const http = require('http');
const { Server } = require('socket.io');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const port = 8081;
const httpServer = http.createServer();
const io = new Server(httpServer, {
    cors: {
        origin: "*",
    }
});

const serverId = process.argv[2];
const clientLoad = process.argv[3];
if (!serverId || !clientLoad) {
    console.error('Error: Please run with the correct arguments.');
    console.log('Example: node index.js nodejs-socketio 100');
    process.exit(1);
}

const throughputCsvPath = `throughput_${serverId}_${clientLoad}clients.csv`;
const throughputCsvWriter = createCsvWriter({
    path: throughputCsvPath,
    header: [
        { id: 'timestamp', title: 'TIMESTAMP' },
        { id: 'throughput', title: 'THROUGHPUT_MSGS_PER_SEC' },
    ],
});

function getLocalTimestamp() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, -1);
}

let messageCounter = 0;

setInterval(() => {
    console.log(`Throughput: ${messageCounter} msg/s`);

    throughputCsvWriter.writeRecords([
        { timestamp: getLocalTimestamp(), throughput: messageCounter }
    ]);

    messageCounter = 0;
}, 1000);

io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id}`);

    socket.on('chat message', (msg) => {
        messageCounter++;
        console.log(`📥 Received message: ${msg}`);
        socket.emit('chat message', msg);
        console.log(`📤 Echoed message: ${msg}`);
    });

    socket.on('disconnect', () => {
        console.log(`❌ Client disconnected: ${socket.id}`);
    });
});

httpServer.listen(port, () => {
    console.log(`🚀 Node.js Websocket Server (Socket.IO) - Echo is running on http://localhost:${port}`);
    console.log(`📝 Logging throughput to file ${throughputCsvPath}`);
});