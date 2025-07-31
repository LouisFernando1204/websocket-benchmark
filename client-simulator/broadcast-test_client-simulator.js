const WebSocketClient = require('websocket').client;
const { io } = require('socket.io-client');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const CONFIG = {
    SERVER_NAME: 'Golang (coder)',
    TARGET_URL: 'ws://localhost:8083/ws',
    SERVER_TYPE: 'ws',
    NUM_CLIENTS: 1000,
    OUTPUT_FILE_LATENCY: 'broadcast-latency_golang-coder_1000clients.csv',
    TEST_DURATION_SECONDS: 60,
    MESSAGE_INTERVAL_MS: 3000,
};

function getLocalTimestamp() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, -1);
}

async function runSimulation() {
    console.log(`🚀 Starting ${CONFIG.SERVER_NAME} - Broadcast Test simulation for ${CONFIG.NUM_CLIENTS} clients...`);
    console.log(`⏳ Test will run for ${CONFIG.TEST_DURATION_SECONDS} seconds.`);

    const latencyCsvWriter = createCsvWriter({
        path: CONFIG.OUTPUT_FILE_LATENCY,
        header: [
            { id: 'timestamp', title: 'TIMESTAMP' },
            { id: 'sender_id', title: 'SENDER_ID' },
            { id: 'receiver_id', title: 'RECEIVER_ID' },
            { id: 'broadcast_latency_ms', title: 'BROADCAST_LATENCY_MS' },
        ],
    });

    const activeConnections = [];

    const createClient = (id) => {
        return new Promise((resolve, reject) => {

            const setupConnectionLogic = (connection) => {
                activeConnections.push(connection);

                if (id === 0) {
                    console.log('✅ Sender client connected.');
                    connection.messageInterval = setInterval(() => {
                        const payload = JSON.stringify({
                            senderId: id,
                            sendTime: process.hrtime.bigint().toString(),
                        });

                        if (CONFIG.SERVER_TYPE === 'socketio') {
                            connection.emit('chat message', payload);
                        } else {
                            connection.sendUTF(payload);
                        }
                    }, CONFIG.MESSAGE_INTERVAL_MS);
                }
                else {
                    const messageEvent = CONFIG.SERVER_TYPE === 'socketio' ? 'chat message' : 'message';
                    connection.on(messageEvent, (message) => {
                        const messageData = (typeof message === 'string') ? message : message.utf8Data;
                        const data = JSON.parse(messageData);

                        const latencyNs = process.hrtime.bigint() - BigInt(data.sendTime);
                        const latencyMs = Number(latencyNs) / 1_000_000;

                        latencyCsvWriter.writeRecords([{
                            timestamp: getLocalTimestamp(),
                            sender_id: data.senderId,
                            receiver_id: id,
                            broadcast_latency_ms: latencyMs.toFixed(3)
                        }]);
                    });
                }
                resolve(connection);
            };

            if (CONFIG.SERVER_TYPE === 'socketio') {
                const socket = io(CONFIG.TARGET_URL);
                socket.on('connect', () => {
                    setupConnectionLogic(socket);
                });
                socket.on('connect_error', reject);
            } else {
                const client = new WebSocketClient();
                client.on('connectFailed', reject);
                client.on('connect', (connection) => {
                    setupConnectionLogic(connection);
                });
                client.connect(CONFIG.TARGET_URL, null);
            }
        });
    };

    console.log('Connecting all clients...');
    const promises = Array.from({ length: CONFIG.NUM_CLIENTS }, (_, i) => createClient(i));
    await Promise.all(promises);

    console.log(`✅ All ${CONFIG.NUM_CLIENTS} clients connected. Broadcast test starting.`);

    setTimeout(() => {
        console.log('\n⌛ Test duration finished. Stopping all clients...');
        for (const conn of activeConnections) {
            if (conn.messageInterval) {
                clearInterval(conn.messageInterval);
            }
            conn.close();
        }
        console.log('✅ Simulation Complete.');
        setTimeout(() => process.exit(0), 2000);
    }, CONFIG.TEST_DURATION_SECONDS * 1000);
}

runSimulation().catch(console.error);