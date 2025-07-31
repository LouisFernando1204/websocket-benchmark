const WebSocket = require('ws');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const port = 8080;
const wss = new WebSocket.Server({ port: port });

const serverId = process.argv[2];
const clientLoad = process.argv[3];
if (!serverId || !clientLoad) {
    console.error('Error: Please run with the correct arguments.');
    console.log('Example: node index.js nodejs-ws 100');
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

wss.on('connection', (ws) => {
    console.log('✅ Client connected');

    ws.on('message', (message) => {
        messageCounter++;
        console.log(`📥 Received message: ${message.toString()}`);
        ws.send(message.toString());
        console.log(`📤 Echoed message: ${message.toString()}`);
    });

    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
});

console.log(`🚀 Node.js Websocket Server (ws) - Echo is running on ws://localhost:${port}`);
console.log(`📝 Logging throughput to file ${throughputCsvPath}`);