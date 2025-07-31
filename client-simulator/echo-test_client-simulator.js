const WebSocketClient = require('websocket').client;
const { io } = require('socket.io-client');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const CONFIG = {
    SERVER_NAME: 'Node.js (ws)',
    TARGET_URL: 'ws://localhost:8080',
    SERVER_TYPE: 'ws',
    NUM_CLIENTS: 100,
    OUTPUT_FILE_RTT: 'rtt_nodejs-ws_100clients.csv',
    OUTPUT_FILE_CONN: 'conn-time_nodejs-ws_100clients.csv',
    TEST_DURATION_SECONDS: 60,
};

function getLocalTimestamp() {
    const date = new Date();
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().slice(0, -1);
}

async function runSimulation() {
    console.log(`🚀 Starting ${CONFIG.SERVER_NAME} - Echo Test simulation for ${CONFIG.NUM_CLIENTS} clients...`);
    console.log(`⏳ Test will run for ${CONFIG.TEST_DURATION_SECONDS} seconds.`);

    const rttCsvWriter = createCsvWriter({
        path: CONFIG.OUTPUT_FILE_RTT,
        header: [
            { id: 'timestamp', title: 'TIMESTAMP' },
            { id: 'client_id', title: 'CLIENT_ID' },
            { id: 'round_trip_time_ms', title: 'RTT_MS' },
        ],
    });

    const connectionCsvWriter = createCsvWriter({
        path: CONFIG.OUTPUT_FILE_CONN,
        header: [
            { id: 'timestamp', title: 'TIMESTAMP' },
            { id: 'client_id', title: 'CLIENT_ID' },
            { id: 'connection_time_ms', title: 'CONNECTION_TIME_MS' },
        ]
    });

    const activeConnections = [];

    const createClient = (id) => {
        return new Promise((resolve, reject) => {
            let messageCounter = 0;
            let startTime;
            const connectionStartTime = process.hrtime.bigint();

            const setupConnectionLogic = (connection) => {
                activeConnections.push(connection);
                const connectionTimeMs = Number(process.hrtime.bigint() - connectionStartTime) / 1_000_000;
                connectionCsvWriter.writeRecords([{
                    timestamp: getLocalTimestamp(),
                    client_id: id,
                    connection_time_ms: connectionTimeMs.toFixed(3)
                }]);

                const sendMessage = () => {
                    if ((connection.connected && CONFIG.SERVER_TYPE === 'ws') || (connection.connected && CONFIG.SERVER_TYPE === 'socketio')) {
                        startTime = process.hrtime.bigint();
                        const payload = "Ping!";

                        if (CONFIG.SERVER_TYPE === 'ws') {
                            connection.sendUTF(payload);
                        } else {
                            connection.emit('chat message', payload);
                        }
                    }
                };

                const messageEvent = CONFIG.SERVER_TYPE === 'socketio' ? 'chat message' : 'message';
                const messageHandler = (message) => {
                    const rtt_ms = Number(process.hrtime.bigint() - startTime) / 1_000_000;
                    rttCsvWriter.writeRecords([{
                        timestamp: getLocalTimestamp(),
                        client_id: id,
                        round_trip_time_ms: rtt_ms.toFixed(3),
                    }]);

                    const messageType = message.type || 'utf8';
                    if (messageType === 'utf8') {
                        sendMessage();
                    }
                };

                connection.on(messageEvent, messageHandler);
                sendMessage();
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
    const connectionPromises = [];
    for (let i = 0; i < CONFIG.NUM_CLIENTS; i++) {
        connectionPromises.push(createClient(i));
        await new Promise(resolve => setTimeout(resolve, 20));
    }
    await Promise.all(connectionPromises);

    console.log(`✅ All ${CONFIG.NUM_CLIENTS} clients connected. Echo test starting.`);

    setTimeout(() => {
        console.log('\n⌛ Test duration finished. Stopping all clients...');
        for (const connection of activeConnections) {
            connection.close();
        }
        console.log('✅ Simulation Complete.');
        setTimeout(() => process.exit(0), 2000);
    }, CONFIG.TEST_DURATION_SECONDS * 1000);
}

runSimulation().catch(console.error);