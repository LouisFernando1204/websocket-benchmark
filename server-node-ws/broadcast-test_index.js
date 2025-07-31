const WebSocket = require('ws');

const port = 8080;
const wss = new WebSocket.Server({ port: port });

const clients = new Set();

wss.on('connection', (ws) => {
    clients.add(ws);
    console.log(`✅ Client connected. Total clients: ${clients.size}`);

    ws.on('message', (message) => {
        clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message.toString());
            }
        });
    });

    ws.on('close', () => {
        clients.delete(ws);
        console.log(`❌ Client disconnected. Total clients: ${clients.size}`);
    });
});

console.log(`🚀 Node.js Websocket Server (ws) - Broadcast is running on ws://localhost:${port}`);